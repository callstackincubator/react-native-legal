import process from 'node:process';

import type { Command } from 'commander';

import { NON_TAB_HELP_LISTING_SUBLIST_OFFSET } from '../constants';
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
}

export function validateCommonReportOptions(options: CLIReportOptions) {
  if (!validFormats.includes(options.format)) {
    console.error(`Invalid format: ${options.format}. Supported formats: ${validFormats.join(', ')}`);
    process.exit(1);
  }
}
