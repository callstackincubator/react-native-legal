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
    children: [],
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

  // 2. Recursively add children
  let depth = 0;
  let incomplete = false;
  let anyChangesAppliedThisIter = true;
  while (Object.keys(data).length > 0 && anyChangesAppliedThisIter) {
    anyChangesAppliedThisIter = false; // reset the flag

    for (const [packageKey, packageInfo] of Object.entries(data)) {
      const parentPackageKeys = packageInfo.parentPackages.length
        ? packageInfo.parentPackages.map((parentPackageInfo) =>
            buildPackageKey({
              name: parentPackageInfo.name,
              version: parentPackageInfo.resolvedVersion,
            }),
          )
        : _selectedRoot === ROOT_PROJECT_ROOT_PACKAGE
        ? [rootPackageKey]
        : [];

      for (const parentPackageKey of parentPackageKeys) {
        if (parentPackageKey in mapping) {
          mapping[parentPackageKey].children ??= [];

          const nodeData: TreeNode = {
            children: [],
            meta: {
              ...packageInfo,
              parentPackageKeys,
              key: buildPackageKey(packageInfo),
            },
            rank: depth,
          };

          graph.setNode(packageKey, nodeData);

          mapping[parentPackageKey].children.push(nodeData);
          mapping[packageKey] = nodeData;

          // append the connection
          graph.setEdge(parentPackageKey, packageKey, { label: packageInfo.dependencyType });

          delete data[packageKey]; // remove processed package

          anyChangesAppliedThisIter = true;
        }
      }
    }

    // failsafe for detecting non-full graph processed - should never happen; it's only possible to validate
    // this in such a simple way as below if the selected root is the root itself (in which case all the packages should be included in the graph)
    if (depth > MAX_TREE_PARSING_DEPTH && root.meta.key === ROOT_PROJECT_ROOT_PACKAGE_KEY) {
      console.warn(
        `Reached maximum tree parsing depth of ${MAX_TREE_PARSING_DEPTH}. Stopping to prevent infinite loop.`,
      );
      incomplete = true;
      break;
    }

    depth++;
  }

  // 3. Create a d3 hierarchy
  return { graph, incomplete, rootPackageKey };
}
