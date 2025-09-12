import type { Types as SharedTypes } from '@callstack/licenses';

import type { PluginScanOptions } from './types';

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
