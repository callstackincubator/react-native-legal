import type { BundleGraphPlatform, BundleGraphSource } from '../types/BundleGraphOptions';
import type { DevDepsMode } from '../types/DevDepsMode';
import type { Format } from '../types/Format';
import type { Output } from '../types/Output';
import type { TransitiveDepsMode } from '../types/TransitiveDepsMode';

export type CLIScanOptions = {
  transitiveDepsMode: TransitiveDepsMode;
  devDepsMode: DevDepsMode;
  includeOptionalDeps: boolean;
  /** Whether to narrow the results down to the packages actually bundled by Metro */
  bundledOnly: boolean;
  /** How to obtain the Metro bundle dependency graph; applies only if `bundledOnly` is `true` */
  bundleSource: BundleGraphSource;
  /** Platforms to resolve the bundle dependency graph for; applies only if `bundledOnly` is `true` */
  bundlePlatforms: BundleGraphPlatform[];
  /** Entry file of the bundle; applies only if `bundledOnly` is `true` and the source resolves to `'metro'` */
  bundleEntryFile?: string;
};

export type CLIReportOptions = {
  format: Format;
  output: Output;
  root: string;
};

export type CLIVisualizeOptions = CLIReportOptions & CLIScanOptions;
