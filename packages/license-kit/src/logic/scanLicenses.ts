import path from 'node:path';

import { type Types, scanBundledDependencies } from '@callstack/licenses';

import { createScanOptionsFactory } from '../scanOptionsUtils';
import type { CLIScanOptions } from '../types/CLIOptions';

/**
 * Scans the licenses of the project's dependencies according to the CLI scan options;
 * if `--bundled-only` is set, the result is narrowed down to the packages present in the Metro bundle dependency graph
 */
export function scanLicenses(packageJsonPath: string, options: CLIScanOptions): Types.AggregatedLicensesMapping {
  return scanBundledDependencies(
    packageJsonPath,
    createScanOptionsFactory(options),
    options.bundledOnly
      ? {
          projectRoot: path.dirname(path.resolve(packageJsonPath)),
          source: options.bundleSource,
          platforms: options.bundlePlatforms,
          entryFile: options.bundleEntryFile,
        }
      : undefined,
  );
}
