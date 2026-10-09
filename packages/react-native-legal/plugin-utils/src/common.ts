import path from 'node:path';

import { type Types as SharedTypes, scanDependencies, scanPackageRoots } from '@callstack/licenses';

import { getMetroPackageRoots } from './metro';
import type { DependencySource, PluginScanOptions } from './types';

const PACKAGE_JSON_SCAN_OPTION_DEFAULTS = {
  devDepsMode: 'none',
  includeOptionalDeps: true,
  transitiveDepsMode: 'all',
} as const satisfies Omit<PluginScanOptions, 'dependencySource'>;

const PACKAGE_JSON_SCAN_OPTION_NAMES = Object.keys(PACKAGE_JSON_SCAN_OPTION_DEFAULTS) as Array<
  keyof typeof PACKAGE_JSON_SCAN_OPTION_DEFAULTS
>;

/**
 * Assigns defaults to the options provided by the user.
 * Must be called with the raw options (before any defaults are assigned), because it validates
 * that the options scanning `package.json` files are not combined with `dependencySource: 'metro'`, which ignores them.
 *
 * @throws When `dependencySource` is `'metro'` and any of the `package.json` scan options is provided
 */
export function resolvePluginScanOptions(options: Partial<PluginScanOptions> = {}): PluginScanOptions {
  const { dependencySource = 'package-json' } = options;

  if (dependencySource === 'metro') {
    const ignoredOptions = PACKAGE_JSON_SCAN_OPTION_NAMES.filter((name) => options[name] !== undefined);

    if (ignoredOptions.length > 0) {
      throw new Error(
        `[react-native-legal] dependencySource: 'metro' cannot be combined with: ${ignoredOptions.join(', ')}. ` +
          `These options only apply when dependencySource is 'package-json'.`,
      );
    }
  }

  return {
    ...PACKAGE_JSON_SCAN_OPTION_DEFAULTS,
    ...Object.fromEntries(Object.entries(options).filter(([, value]) => value !== undefined)),
    dependencySource,
  };
}

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
