import path from 'node:path';

import { type Types as SharedTypes, scanBundledDependencies } from '@callstack/licenses';

import type { PluginLicensesScanner, PluginScanOptions } from './types';

export function createPluginScanOptionsFactory(
  pluginScanOptions: PluginScanOptions,
): SharedTypes.ScanPackageOptionsFactory {
  return function ({ isRoot, isWorkspacePackage }) {
    let includeDevDependencies = false;

    switch (pluginScanOptions.devDepsMode) {
      case 'root-only':
        includeDevDependencies = isRoot;
        break;

      case 'none':
        includeDevDependencies = false;
        break;
    }

    let includeTransitiveDependencies = true;

    switch (pluginScanOptions.transitiveDepsMode) {
      case 'all':
        includeTransitiveDependencies = true;
        break;

      case 'from-external-only':
        includeTransitiveDependencies = !isWorkspacePackage;
        break;

      case 'from-workspace-only':
        includeTransitiveDependencies = isWorkspacePackage;
        break;

      case 'none':
        includeTransitiveDependencies = false;
        break;
    }

    const includeOptionalDependencies = pluginScanOptions.includeOptionalDeps;

    return {
      includeDevDependencies,
      includeTransitiveDependencies,
      includeOptionalDependencies,
    };
  };
}

/**
 * Creates a licenses scanner that applies the plugin scan options; if `bundledOnly` is set,
 * the scanned licenses are narrowed down to the packages present in the Metro bundle dependency graph of the given platform
 */
export function createPluginLicensesScanner(pluginScanOptions: PluginScanOptions): PluginLicensesScanner {
  const scanOptionsFactory = createPluginScanOptionsFactory(pluginScanOptions);

  return function (appPackageJsonPath, platform) {
    return scanBundledDependencies(
      appPackageJsonPath,
      scanOptionsFactory,
      pluginScanOptions.bundledOnly
        ? {
            projectRoot: path.dirname(path.resolve(appPackageJsonPath)),
            source: pluginScanOptions.bundleSource ?? 'auto',
            platforms: pluginScanOptions.bundlePlatforms?.length ? pluginScanOptions.bundlePlatforms : [platform],
            entryFile: pluginScanOptions.bundleEntryFile,
          }
        : undefined,
    );
  };
}
