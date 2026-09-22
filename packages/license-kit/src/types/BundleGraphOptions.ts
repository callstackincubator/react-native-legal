import { Types } from '@callstack/licenses';

/**
 * Enumerates all valid CLI bundle graph source flag values
 *
 * @see {@link BundleGraphSource}
 */
export const validBundleGraphSources = Types.validBundleGraphSources;

/**
 * Type of CLI flag that controls, how the Metro bundle dependency graph is obtained:
 * - 'auto' ('expo' if the project depends on `expo`, otherwise 'metro')
 * - 'metro' (`metro get-dependencies`)
 * - 'expo' (`expo export --source-maps`)
 */
export type BundleGraphSource = Types.BundleGraphSource;

/**
 * Enumerates all valid CLI bundle graph platform flag values
 */
export const validBundleGraphPlatforms: readonly Types.BundleGraphPlatform[] = ['ios', 'android', 'web'];

export type BundleGraphPlatform = Types.BundleGraphPlatform;
