import path from 'node:path';

import { type Types as SharedTypes, scanDependencies, scanPackageRoots } from '@callstack/licenses';

import { getMetroPackageRoots } from './metro';
import type { DependencySource, PluginScanOptions } from './types';

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
 * Collects license information of the app's NPM dependencies,
 * using the method selected with `dependencySource`
 *
 * - `package-json` - scans dependencies declared in `package.json` (and their dependencies)
 * - `metro` - takes packages included in the Metro dependency graph of the app for a given platform
 */
export async function scanLicenses({
  projectRoot,
  platform,
  dependencySource,
  scanOptionsFactory,
}: {
  projectRoot: string;
  platform: 'ios' | 'android';
  dependencySource: DependencySource;
  scanOptionsFactory: SharedTypes.ScanPackageOptionsFactory;
}): Promise<SharedTypes.AggregatedLicensesMapping> {
  if (dependencySource === 'metro') {
    const packageRoots = await getMetroPackageRoots(projectRoot, platform);

    return scanPackageRoots(packageRoots);
  }

  return scanDependencies(path.join(projectRoot, 'package.json'), scanOptionsFactory);
}
