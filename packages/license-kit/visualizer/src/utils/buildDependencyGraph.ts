'use client';

import {
  DEFAULT_RADIUS,
  MAX_TREE_PARSING_DEPTH,
  ROOT_PROJECT_ROOT_PACKAGE,
  ROOT_PROJECT_ROOT_PACKAGE_KEY,
} from '@/constants';
import type { TreeNode } from '@/types/TreeNode';
import type { Types } from '@callstack/licenses';
import { graphlib } from '@dagrejs/dagre';
import _ from 'lodash';

import { buildPackageKey } from './packageUtils';

export type DependencyGraphResult = {
  graph: graphlib.Graph<TreeNode>;
  incomplete: boolean;
  rootPackageKey: string;
};

export function buildDependencyGraph(
  _data: Types.AggregatedLicensesMapping,
  _selectedRoot: Types.License = ROOT_PROJECT_ROOT_PACKAGE,
): DependencyGraphResult {
  const data = _.cloneDeep(_data);

  const graph = new graphlib.Graph<TreeNode>().setGraph({
    ranksep: DEFAULT_RADIUS * 6,
    nodesep: DEFAULT_RADIUS * 3,
  });

  // 1. Build the tree structure
  const rootPackageKey = buildPackageKey(_selectedRoot);
  const root: TreeNode = {
    meta: {
      ..._selectedRoot,
      parentPackageKeys: [],
      key: rootPackageKey,
    },
    rank: 0,
  };

  const mapping: Record<string, TreeNode> = {};

  mapping[root.meta.key] = root;

  graph.setNode(rootPackageKey, root);

  const currentCustomRootParentTraits = new Set(_selectedRoot === ROOT_PROJECT_ROOT_PACKAGE ? [] : [_selectedRoot]);

  // 2. Recursively add graph nodes
  let childAdditionDepth = 0;
  let incomplete = false;
  let anyChangesAppliedThisIter = true;

  // attempt to insert children of packages already in the graph
  while (Object.keys(data).length > 0 && anyChangesAppliedThisIter) {
    anyChangesAppliedThisIter = false; // reset the flag

    for (const [packageKey, packageLicense] of Object.entries(data)) {
      const parentPackageKeys = packageLicense.parentPackages.length
        ? packageLicense.parentPackages.map((parentPackageInfo) =>
            buildPackageKey({
              name: parentPackageInfo.name,
              version: parentPackageInfo.resolvedVersion,
            }),
          )
        : _selectedRoot === ROOT_PROJECT_ROOT_PACKAGE
        ? [ROOT_PROJECT_ROOT_PACKAGE_KEY]
        : [];

      for (const parentPackageKey of parentPackageKeys) {
        if (parentPackageKey in mapping && !graph.hasNode(packageKey)) {
          const nodeData: TreeNode = {
            meta: {
              ...packageLicense,
              parentPackageKeys,
              key: packageKey,
            },
            rank: childAdditionDepth,
          };

          graph.setNode(packageKey, nodeData);

          mapping[packageKey] = nodeData;

          // append the connection
          graph.setEdge(parentPackageKey, packageKey, { label: packageLicense.dependencyType });

          delete data[packageKey]; // remove processed package

          anyChangesAppliedThisIter = true;
        }
      }
    }

    childAdditionDepth++;

    // failsafe for detecting non-full graph processed - should never happen; it's only possible to validate
    // this in such a simple way as below if the selected root is the root itself (in which case all the packages should be included in the graph)
    if (childAdditionDepth > MAX_TREE_PARSING_DEPTH && root.meta.key === ROOT_PROJECT_ROOT_PACKAGE_KEY) {
      console.warn(
        `Reached maximum tree parsing depth of ${MAX_TREE_PARSING_DEPTH} (construction of direct sub-graph of selected root). Stopping to prevent infinite loop.`,
      );
      incomplete = true;
      break;
    }
  }

  // additionally, include packages that build up the dependency source trait of the custom root package (if any selected)
  // the insertion logic is done only after the standard children are inserted to prevent addition of the whole subgraphs
  // of the trait from current selected root to root project, since we only want the trait to be added
  let rootTraitAdditionDepth = -1;
  anyChangesAppliedThisIter = true;
  while (Object.keys(data).length > 0 && anyChangesAppliedThisIter) {
    anyChangesAppliedThisIter = false; // reset the flag

    for (const [prevRootTraitPackage, prevRootTraitPackageLicense] of currentCustomRootParentTraits.entries()) {
      for (const nextRootTraitPackageInfoOrLicense of prevRootTraitPackageLicense.parentPackages.length
        ? prevRootTraitPackageLicense.parentPackages
        : [ROOT_PROJECT_ROOT_PACKAGE]) {
        const nextRootTraitPackageKey = buildPackageKey(
          'resolvedVersion' in nextRootTraitPackageInfoOrLicense
            ? {
                name: nextRootTraitPackageInfoOrLicense.name,
                version: nextRootTraitPackageInfoOrLicense.resolvedVersion,
              }
            : nextRootTraitPackageInfoOrLicense,
        );

        if (!graph.node(nextRootTraitPackageKey)) {
          const nextRootTraitPackageLicense =
            'resolvedVersion' in nextRootTraitPackageInfoOrLicense
              ? data[nextRootTraitPackageKey]
              : nextRootTraitPackageInfoOrLicense;
          const nodeData: TreeNode = {
            meta: {
              ...nextRootTraitPackageLicense,
              parentPackageKeys: [nextRootTraitPackageKey],
              key: nextRootTraitPackageKey,
            },
            rank: rootTraitAdditionDepth,
          };

          graph.setNode(nextRootTraitPackageKey, nodeData);

          mapping[nextRootTraitPackageKey] = nodeData;

          // append the connection
          graph.setEdge(nextRootTraitPackageKey, buildPackageKey(prevRootTraitPackage), {
            label: nextRootTraitPackageLicense.dependencyType,
          });

          // add the next trait to the set to be processed next iteration
          if (nextRootTraitPackageLicense !== ROOT_PROJECT_ROOT_PACKAGE) {
            currentCustomRootParentTraits.add(nextRootTraitPackageLicense);
          }

          delete data[nextRootTraitPackageKey]; // remove processed package

          anyChangesAppliedThisIter = true;
        }
      }

      // remove the previous trait from the set to be processed next iteration
      currentCustomRootParentTraits.delete(prevRootTraitPackage);
    }

    rootTraitAdditionDepth--;

    // failsafe for detecting non-full graph processed - should never happen; it's only possible to validate
    // this in such a simple way as below if the selected root is the root itself (in which case all the packages should be included in the graph)
    if (Math.abs(rootTraitAdditionDepth) > MAX_TREE_PARSING_DEPTH && root.meta.key === ROOT_PROJECT_ROOT_PACKAGE_KEY) {
      console.warn(
        `Reached maximum graph depth of ${MAX_TREE_PARSING_DEPTH} (construction of root trait). Stopping to prevent infinite loop.`,
      );
      incomplete = true;
      break;
    }
  }

  // 3. Create a d3 hierarchy
  return { graph, incomplete, rootPackageKey };
}
