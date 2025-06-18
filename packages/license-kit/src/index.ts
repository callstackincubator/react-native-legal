#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import { scanDependencies } from '@callstack/react-native-legal-shared';
import { Command } from 'commander';

import { version } from '../package.json';

import {
  ERROR_EMOJI,
  NON_TAB_HELP_LISTING_SUBLIST_OFFSET,
  STRONG_COPYLEFT_LICENSES,
  WARNING_EMOJI,
  WEAK_COPYLEFT_LICENSES,
} from './constants';
import type { CLIScanOptions } from './scanOptionsUtils';
import { createScanOptionsFactory } from './scanOptionsUtils';
import { serializeReport } from './serializeReport';
import { type DevDepsMode, validDevDepsModes } from './types/DevDepsMode';
import { type Format, validFormats } from './types/Format';
import type { Output } from './types/Output';
import { type TransitiveDepsMode, validTransitiveDepsModes } from './types/TransitiveDepsMode';

const program = new Command();

program.name('license-kit').description('Scan dependencies and check for copyleft licenses.').version(version);

function curryCommonScanOptions(command: Command): Command {
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
    );
}

function validateCommonScanOptions(options: CLIScanOptions) {
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

curryCommonScanOptions(
  program
    .command('copyleft')
    .description(
      'Check for copyleft licenses. Exits with error if strong copyleft licenses are found.' +
        '\nExit codes:' +
        `\n${NON_TAB_HELP_LISTING_SUBLIST_OFFSET}- 0 - no copyleft licenses found` +
        `\n${NON_TAB_HELP_LISTING_SUBLIST_OFFSET}- 1 - strong copyleft licenses found` +
        `\n${NON_TAB_HELP_LISTING_SUBLIST_OFFSET}- 2 - weak copyleft licenses found (if --error-on-weak is set)`,
    )
    .option('--error-on-weak', 'Exit with error if weak copyleft licenses are found', false)
    .option('--root [path]', 'Path to the root of your project', '.'),
).action((options) => {
  validateCommonScanOptions(options);

  const repoRootPath = path.resolve(process.cwd(), options.root);
  const packageJsonPath = path.join(repoRootPath, 'package.json');

  if (!fs.existsSync(packageJsonPath)) {
    console.error(`package.json not found at ${packageJsonPath}`);
    process.exit(1);
  }

  const licenses = scanDependencies(packageJsonPath, createScanOptionsFactory(options));

  const strongCopyleftLicensesFound: string[] = [];
  const weakCopyleftLicensesFound: string[] = [];

  for (const [key, value] of Object.entries(licenses)) {
    STRONG_COPYLEFT_LICENSES.find((license) => {
      if (value.type === license) {
        strongCopyleftLicensesFound.push(`- ${key}: ${value.type} (${value.file || value.url})`);
        return true;
      }
    });

    WEAK_COPYLEFT_LICENSES.find((license) => {
      if (value.type === license) {
        weakCopyleftLicensesFound.push(`- ${key}: ${value.type} (${value.file || value.url})`);
        return true;
      }
    });
  }

  let exitCode = 0,
    noCopyleftLicensesFound = true;

  if (strongCopyleftLicensesFound.length > 0) {
    console.error(`${ERROR_EMOJI} Copyleft licenses found in the following dependencies:`);

    strongCopyleftLicensesFound.forEach((entry) => {
      console.error(entry);
    });

    exitCode = 1;
    noCopyleftLicensesFound = false;
  }

  if (weakCopyleftLicensesFound.length > 0) {
    console.error(
      `${
        options.errorOnWeak ? ERROR_EMOJI : WARNING_EMOJI
      } Weak copyleft licenses found in the following dependencies:`,
    );

    weakCopyleftLicensesFound.forEach((entry) => {
      (options.errorOnWeak ? console.error : console.warn)(entry);
    });

    if (options.errorOnWeak) {
      exitCode = 2;
    }

    noCopyleftLicensesFound = false;
  }

  if (noCopyleftLicensesFound) {
    console.log('✅ No copyleft licenses found');
  }

  if (exitCode != 0) {
    process.exit(exitCode);
  }
});

curryCommonScanOptions(
  program
    .command('report')
    .description('Generate a license report for your project.')
    .option('--root [path]', 'Path to the root of your project', '.')
    .option('--format [type]', "Output format: 'json', 'about-json', 'text', 'markdown'", 'json' satisfies Format)
    .option('--output [path]', "Where to write the output: 'stdout' or a file path", 'stdout' satisfies Output),
).action((options) => {
  validateCommonScanOptions(options);

  const repoRootPath = path.resolve(process.cwd(), options.root);
  const packageJsonPath = path.join(repoRootPath, 'package.json');

  if (!fs.existsSync(packageJsonPath)) {
    console.error(`package.json not found at ${packageJsonPath}`);
    process.exit(1);
  }

  if (!validFormats.includes(options.format)) {
    console.error(`Invalid format: ${options.format}. Supported formats: ${validFormats.join(', ')}`);
    process.exit(1);
  }

  const licenses = scanDependencies(packageJsonPath, createScanOptionsFactory(options));
  const serializedResult = serializeReport({ licenses, format: options.format as Format });

  const output: Output = options.output;

  if (output === 'stdout') {
    console.log(serializedResult);
  } else {
    const outputPath = path.resolve(repoRootPath, output);

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, serializedResult);

    console.log(`Output written to ${outputPath}`);
  }
});

program
  .command('help', { isDefault: false })
  .description('Show help message')
  .action(() => {
    program.outputHelp();
  });

if (!process.argv.slice(2).length) {
  program.outputHelp();
} else {
  program.parse(process.argv);
}
