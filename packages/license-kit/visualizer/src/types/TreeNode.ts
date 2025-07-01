import { type Types } from '@callstack/licenses';

export type TreeNode = {
  children: TreeNode[];
  meta: Types.LicenseObj & { parentPackageKey: string; key: string };
  depth: number;
};
