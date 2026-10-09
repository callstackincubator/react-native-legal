import type { Types as SharedTypes } from '@callstack/licenses';

export type DependencySource = 'package-json' | 'metro';

export interface PluginScanOptions {
  dependencySource: DependencySource;
  devDepsMode: 'root-only' | 'none';
  includeOptionalDeps: boolean;
  transitiveDepsMode: 'all' | 'from-external-only' | 'from-workspace-only' | 'none';
  additionalProjectRoots: readonly string[];
}

export type PlatformPluginOptions = {
  scanOptionsFactory: SharedTypes.ScanPackageOptionsFactory;
  dependencySource: DependencySource;
  additionalProjectRoots: readonly string[];
};
