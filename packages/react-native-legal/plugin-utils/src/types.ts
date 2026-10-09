import type { Types as SharedTypes } from '@callstack/licenses';

export interface PluginScanOptions {
  devDepsMode: 'root-only' | 'none';
  includeOptionalDeps: boolean;
  transitiveDepsMode: 'all' | 'from-external-only' | 'from-workspace-only' | 'none';
  additionalProjectRoots: string[];
}

export type PlatformPluginOptions = {
  scanOptionsFactory: SharedTypes.ScanPackageOptionsFactory;
  additionalProjectRoots: string[];
};
