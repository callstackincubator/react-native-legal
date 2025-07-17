import { type Types } from '@callstack/licenses';

export type TreeNode = {
  children: TreeNode[];
  meta: Types.License & { parentPackageKeys: string[]; key: string };
  rank: number;
};
