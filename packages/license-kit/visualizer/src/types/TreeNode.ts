import { type Types } from '@callstack/licenses';

export type TreeNode = {
  meta: Types.License & { parentPackageKeys: string[]; key: string };
  rank: number;
};
