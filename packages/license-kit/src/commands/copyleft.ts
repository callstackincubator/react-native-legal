import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import { scanDependencies } from '@callstack/licenses';
import type { Command } from 'commander';

import {
  ERROR_EMOJI,
  NON_TAB_HELP_LISTING_SUBLIST_OFFSET,
  STRONG_COPYLEFT_LICENSES,
  WARNING_EMOJI,
  WEAK_COPYLEFT_LICENSES,
} from '../constants';
import { createScanOptionsFactory } from '../scanOptionsUtils';
import { curryCommonScanOptions, validateCommonScanOptions } from '../utils/commandUtils';

export default function copyleftCommandSetup(program: Command): Command {
  return curryCommonScanOptions(
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

    for (const value of Object.values(licenses)) {
      if (!value.type) {
        continue;
      }

      if (STRONG_COPYLEFT_LICENSES.has(value.type)) {
        strongCopyleftLicensesFound.push(`- ${value.name}: ${value.type} (${value.file || value.url})`);
      }

      if (WEAK_COPYLEFT_LICENSES.has(value.type)) {
        weakCopyleftLicensesFound.push(`- ${value.name}: ${value.type} (${value.file || value.url})`);
      }
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
}
