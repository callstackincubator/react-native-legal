/**
 * Source of the bundle dependency graph used to determine, which packages are actually bundled by Metro
 * - `'metro'` - runs `metro get-dependencies` against the project's Metro config
 * - `'expo'` - runs `expo export` with source maps and reads the bundled modules from the emitted source maps
 * - `'auto'` - `'expo'` if the project depends on `expo`, otherwise `'metro'`
 */
export type BundleGraphSource = 'auto' | 'metro' | 'expo';

/**
 * Enumerates all valid bundle graph source values
 *
 * @see {@link BundleGraphSource}
 */
export const validBundleGraphSources: readonly BundleGraphSource[] = ['auto', 'metro', 'expo'];

/**
 * Platform for which the bundle dependency graph should be resolved
 */
export type BundleGraphPlatform = 'ios' | 'android' | 'web';

/**
 * Options controlling how the Metro dependency graph is obtained
 */
export type GetBundledPackagesOptions = {
  /** Path to the root of the project (directory containing the app's `package.json`) */
  projectRoot: string;

  /** Source of the dependency graph; defaults to `'auto'` */
  source?: BundleGraphSource;

  /** Platforms to resolve the dependency graph for; the result is a union across platforms; defaults to `['ios', 'android']` */
  platforms?: BundleGraphPlatform[];

  /**
   * Entry file of the bundle (relative to `projectRoot` or absolute); only used with the `'metro'` source.
   * Defaults to the `main` field of the project's `package.json` or the first existing of `index.js`, `index.ts`, `index.tsx`, `index.jsx`
   */
  entryFile?: string;

  /** Whether to resolve a development graph (`true`) or a production graph (`false`); defaults to `false` */
  dev?: boolean;

  /** Whether to reset the Metro cache before resolving the graph (`'expo'` source only; `metro get-dependencies` never uses the cache); defaults to `false` */
  resetCache?: boolean;
};

/**
 * Result of resolving the set of packages that are actually bundled by Metro
 */
export type BundledPackages = {
  /** Keys in the format `<package-name>@<resolved-version>` of all bundled packages, matching the keys of {@link AggregatedLicensesMapping} */
  packageKeys: Set<string>;

  /** Names of all bundled packages */
  packageNames: Set<string>;

  /** Absolute paths of all modules in the bundle dependency graph */
  modulePaths: string[];
};
