import { type Types } from '@callstack/licenses';
import type { NodeLabel } from '@dagrejs/dagre';

export interface TreeNode extends NodeLabel {
  meta: Types.License & { parentPackageKeys: string[]; key: string };
  rank: number;
}
