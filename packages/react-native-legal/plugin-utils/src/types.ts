import type { Types as SharedTypes } from '@callstack/licenses';

export interface PluginScanOptions {
  devDepsMode: 'root-only' | 'none';
  includeOptionalDeps: boolean;
  transitiveDepsMode: 'all' | 'from-external-only' | 'from-workspace-only' | 'none';

  /**
   * Whether to narrow the results down to the packages actually bundled by Metro,
   * by reading the bundle dependency graph (`metro get-dependencies` / `expo export --source-maps`)
   *
   * @default false
   */
  bundledOnly?: boolean;

  /**
   * How to obtain the Metro bundle dependency graph; applies only if `bundledOnly` is `true`
   * - `'auto'` - `'expo'` if the project depends on `expo`, otherwise `'metro'`
   * - `'metro'` - `metro get-dependencies`
   * - `'expo'` - `expo export --source-maps`
   *
   * @default 'auto'
   */
  bundleSource?: SharedTypes.BundleGraphSource;

  /**
   * Platforms to resolve the bundle dependency graph for; applies only if `bundledOnly` is `true`;
   * by default, the graph is resolved for the platform being set up (`ios` for the iOS project, `android` for the Android project)
   */
  bundlePlatforms?: SharedTypes.BundleGraphPlatform[];

  /**
   * Entry file of the bundle, relative to the project root; applies only if `bundledOnly` is `true` and the source resolves to `'metro'`;
   * defaults to the `main` field of `package.json` or `index.{js,ts,tsx,jsx}`
   */
  bundleEntryFile?: string;
}

/**
 * Scans the licenses of the project's dependencies for a given platform, according to the plugin scan options
 *
 * @param appPackageJsonPath Path to the `package.json` file of the application
 * @param platform Platform being set up
 */
export type PluginLicensesScanner = (
  appPackageJsonPath: string,
  platform: SharedTypes.BundleGraphPlatform,
) => SharedTypes.AggregatedLicensesMapping;
