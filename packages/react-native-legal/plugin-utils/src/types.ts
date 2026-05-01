export interface PluginScanOptions {
  devDepsMode: 'root-only' | 'none';
  includeOptionalDeps: boolean;
  transitiveDepsMode: 'all' | 'from-external-only' | 'from-workspace-only' | 'none';
}

export interface AboutLibrariesOptions {
  gitHubApiToken?: string;
}

export interface LicensePlistOptions {
  githubToken?: string;
  addVersionNumbers?: boolean;
}

export interface PluginOptions extends PluginScanOptions {
  aboutLibraries?: AboutLibrariesOptions;
  licensePlist?: LicensePlistOptions;
}
