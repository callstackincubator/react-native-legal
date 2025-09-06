export interface PluginScanOptions {
  devDepsMode: 'root-only' | 'none';
  includeOptionalDeps: boolean;
  transitiveDepsMode: 'all' | 'from-external-only' | 'from-workspace-only' | 'none';
}
