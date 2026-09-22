import process from 'node:process';

import type { Command } from 'commander';

import { NON_TAB_HELP_LISTING_SUBLIST_OFFSET } from '../constants';
import {
  type BundleGraphPlatform,
  type BundleGraphSource,
  validBundleGraphPlatforms,
  validBundleGraphSources,
} from '../types/BundleGraphOptions';
import type { CLIReportOptions, CLIScanOptions } from '../types/CLIOptions';
import { type DevDepsMode, validDevDepsModes } from '../types/DevDepsMode';
import { type Format, validFormats } from '../types/Format';
import { type Output } from '../types/Output';
import { type TransitiveDepsMode, validTransitiveDepsModes } from '../types/TransitiveDepsMode';

export function curryCommonScanOptions(command: Command): Command {
  return command
    .option(
      '--tm, --transitive-deps-mode [mode]',
      'Controls, which transitive dependencies are included:' +
        `\n${NON_TAB_HELP_LISTING_SUBLIST_OFFSET}- 'all',` +
        `\n${NON_TAB_HELP_LISTING_SUBLIST_OFFSET}- 'from-external-only' (only transitive dependencies of direct dependencies specified by non-workspace:... specifiers),` +
        `\n${NON_TAB_HELP_LISTING_SUBLIST_OFFSET}- 'from-workspace-only' (only transitive dependencies of direct dependencies specified by \`workspace:\` specifier),` +
        `\n${NON_TAB_HELP_LISTING_SUBLIST_OFFSET}- 'none'` +
        '\n', // newline for auto-description of the default value
      'all' satisfies TransitiveDepsMode,
    )
    .option(
      '--dm, --dev-deps-mode [mode]',
      'Controls, whether and how development dependencies are included:' +
        `\n${NON_TAB_HELP_LISTING_SUBLIST_OFFSET}- 'root-only' (only direct devDependencies from the scanned project's root package.json)` +
        `\n${NON_TAB_HELP_LISTING_SUBLIST_OFFSET}- 'none'` +
        '\n', // newline for auto-description of the default value
      'root-only' satisfies DevDepsMode,
    )
    .option(
      '--od, --include-optional-deps [include]',
      'Whether to include optionalDependencies in the scan; other flags apply',
      (value) => value === 'true' || value === '1',
      true,
    )
    .option(
      '--bundled-only',
      'Narrow the results down to the packages actually bundled by Metro, by reading the bundle dependency graph' +
        `\n${NON_TAB_HELP_LISTING_SUBLIST_OFFSET}(runs 'metro get-dependencies' or 'expo export --source-maps' in the project root)` +
        '\n', // newline for auto-description of the default value
      false,
    )
    .option(
      '--bundle-source [source]',
      'How to obtain the Metro bundle dependency graph (applies only with --bundled-only):' +
        `\n${NON_TAB_HELP_LISTING_SUBLIST_OFFSET}- 'auto' ('expo' if the project depends on expo, otherwise 'metro'),` +
        `\n${NON_TAB_HELP_LISTING_SUBLIST_OFFSET}- 'metro' (metro get-dependencies),` +
        `\n${NON_TAB_HELP_LISTING_SUBLIST_OFFSET}- 'expo' (expo export --source-maps)` +
        '\n', // newline for auto-description of the default value
      'auto' satisfies BundleGraphSource,
    )
    .option(
      '--bundle-platforms [platforms]',
      "Comma-separated platforms to resolve the bundle dependency graph for: 'ios', 'android', 'web' (applies only with --bundled-only)",
      (value) => value.split(',').map((platform) => platform.trim()) as BundleGraphPlatform[],
      ['ios', 'android'] satisfies BundleGraphPlatform[],
    )
    .option(
      '--bundle-entry-file [path]',
      "Entry file of the bundle, relative to the project root (applies only with --bundled-only and the 'metro' source); defaults to the 'main' field of package.json or index.{js,ts,tsx,jsx}",
    );
}

export function curryReportOptions(command: Command): Command {
  return command
    .option('--root [path]', 'Path to the root of your project', '.')
    .option('--format [type]', "Output format: 'json', 'about-json', 'text', 'markdown'", 'json' satisfies Format)
    .option('--output [path]', "Where to write the output: 'stdout' or a file path", 'stdout' satisfies Output);
}

export function validateCommonScanOptions(options: CLIScanOptions) {
  if (!validDevDepsModes.includes(options.devDepsMode)) {
    console.error(
      `Invalid development dependencies scan mode: ${options.devDepsMode}. Supported modes: ${validDevDepsModes.join(
        ', ',
      )}`,
    );
    process.exit(1);
  }

  if (!validTransitiveDepsModes.includes(options.transitiveDepsMode)) {
    console.error(
      `Invalid transitive dependencies scan mode: ${
        options.transitiveDepsMode
      }. Supported modes: ${validTransitiveDepsModes.join(', ')}`,
    );
    process.exit(1);
  }

  if (!validBundleGraphSources.includes(options.bundleSource)) {
    console.error(
      `Invalid bundle source: ${options.bundleSource}. Supported sources: ${validBundleGraphSources.join(', ')}`,
    );
    process.exit(1);
  }

  const invalidPlatforms = options.bundlePlatforms.filter((platform) => !validBundleGraphPlatforms.includes(platform));

  if (invalidPlatforms.length > 0) {
    console.error(
      `Invalid bundle platform(s): ${invalidPlatforms.join(', ')}. Supported platforms: ${validBundleGraphPlatforms.join(
        ', ',
      )}`,
    );
    process.exit(1);
  }
}

export function validateCommonReportOptions(options: CLIReportOptions) {
  if (!validFormats.includes(options.format)) {
    console.error(`Invalid format: ${options.format}. Supported formats: ${validFormats.join(', ')}`);
    process.exit(1);
  }
}
