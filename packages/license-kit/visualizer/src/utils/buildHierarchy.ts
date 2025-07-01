'use client';

import type { Types } from '@callstack/licenses';
import { graphlib } from '@dagrejs/dagre';
import _ from 'lodash';

import { MAX_TREE_PARSING_DEPTH } from '@/constants';
import type { TreeNode } from '@/types/TreeNode';

export function buildHierarchy(_data: Types.AggregatedLicensesObj): {
  graph: graphlib.Graph<TreeNode>;
  incomplete: boolean;
} {
  const data = _.cloneDeep(_data);

  const graph = new graphlib.Graph<TreeNode>().setGraph({});

  // 1. Build the tree structure
  const rootKey = 'root@0.0.0';

  const root: TreeNode = {
    children: [],
    meta: {
      name: 'root',
      dependencyType: 'dependency',
      version: '0.0.0',
      requiredVersion: '0.0.0',
      parentPackageKey: '',
      key: rootKey,
    },
    depth: 0,
  };

  const mapping: Record<string, TreeNode> = {};

  mapping[root.meta.key] = root;

  graph.setNode(rootKey, root);

  // 2. Recursively add children
  let depth = 0;
  let incomplete = false;
  while (Object.keys(data).length > 0) {
    for (const [packageKey, packageInfo] of Object.entries(data)) {
      const parentKey = packageInfo.parentPackageName
        ? `${packageInfo.parentPackageName}@${packageInfo.parentPackageResolvedVersion}`
        : rootKey;

      if (parentKey in mapping) {
        mapping[parentKey].children ??= [];
        const nodeData: TreeNode = {
          children: [],
          meta: {
            ...packageInfo,
            parentPackageKey: parentKey,
            key: `${packageInfo.name}@${packageInfo.version}`,
          },
          depth,
        };

        graph.setNode(packageKey, nodeData);
        // graph.node(packageKey).padding = 200;

        mapping[parentKey].children.push(nodeData);
        mapping[packageKey] = nodeData;

        // append the connection
        graph.setEdge(parentKey, packageKey, { label: packageInfo.dependencyType });

        delete data[packageKey]; // remove processed package
      }
    }

    // failsafe
    if (depth > MAX_TREE_PARSING_DEPTH) {
      incomplete = true;
      break;
    }

    depth++;
  }

  // 3. Create a d3 hierarchy
  return { graph, incomplete };
}
