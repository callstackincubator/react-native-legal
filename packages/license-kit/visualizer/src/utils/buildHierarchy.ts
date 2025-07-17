'use client';

import type { Types } from '@callstack/licenses';
import { graphlib } from '@dagrejs/dagre';
import _ from 'lodash';

import { DEFAULT_RADIUS, MAX_TREE_PARSING_DEPTH, ROOT_PACKAGE_KEY } from '@/constants';
import type { TreeNode } from '@/types/TreeNode';
import { buildPackageKey } from './packageUtils';

export function buildHierarchy(_data: Types.AggregatedLicensesMapping): {
  graph: graphlib.Graph<TreeNode>;
  incomplete: boolean;
} {
  const data = _.cloneDeep(_data);

  const graph = new graphlib.Graph<TreeNode>().setGraph({
    ranksep: DEFAULT_RADIUS * 6,
    nodesep: DEFAULT_RADIUS * 3,
  });

  // 1. Build the tree structure
  const root: TreeNode = {
    children: [],
    meta: {
      name: 'root',
      dependencyType: 'dependency',
      version: '0.0.0',
      requiredVersion: '0.0.0',
      parentPackageKeys: [],
      parentPackages: [],
      key: ROOT_PACKAGE_KEY,
    },
    rank: 0,
  };

  const mapping: Record<string, TreeNode> = {};

  mapping[root.meta.key] = root;

  graph.setNode(ROOT_PACKAGE_KEY, root);

  // 2. Recursively add children
  let depth = 0;
  let incomplete = false;
  while (Object.keys(data).length > 0) {
    for (const [packageKey, packageInfo] of Object.entries(data)) {
      const parentPackageKeys = packageInfo.parentPackages.length
        ? packageInfo.parentPackages.map((parentPackageInfo) =>
            buildPackageKey({
              name: parentPackageInfo.name,
              version: parentPackageInfo.resolvedVersion,
            }),
          )
        : [ROOT_PACKAGE_KEY];

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
        }
      }
    }

    // failsafe
    if (depth > MAX_TREE_PARSING_DEPTH) {
      console.warn(
        `Reached maximum tree parsing depth of ${MAX_TREE_PARSING_DEPTH}. Stopping to prevent infinite loop.`,
      );
      incomplete = true;
      break;
    }

    depth++;
  }

  // 3. Create a d3 hierarchy
  return { graph, incomplete };
}
