import type { Types as SharedTypes } from '@callstack/licenses';

export type PlatformCommandOptions = {
  scanOptionsFactory: SharedTypes.ScanPackageOptionsFactory;
  additionalProjectRoots: string[];
};
