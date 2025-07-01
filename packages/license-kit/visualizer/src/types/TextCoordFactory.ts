import type { Node } from '@dagrejs/dagre';

import type { TreeNode } from './TreeNode';

export type TextCoordFactory = (node: Node<TreeNode>) => number;
