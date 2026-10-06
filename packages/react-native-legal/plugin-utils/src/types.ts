export type DependencySource = 'package-json' | 'metro';

export interface PluginScanOptions {
  dependencySource: DependencySource;
  devDepsMode: 'root-only' | 'none';
  includeOptionalDeps: boolean;
  transitiveDepsMode: 'all' | 'from-external-only' | 'from-workspace-only' | 'none';
}
