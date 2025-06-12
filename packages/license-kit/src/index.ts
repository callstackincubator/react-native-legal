#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import { scanDependencies } from '@callstack/react-native-legal-shared';
import { Command } from 'commander';

import { version } from '../package.json';

import { STRONG_COPYLEFT_LICENSES, WEAK_COPYLEFT_LICENSES } from './constants';
import { serializeReport } from './serializeReport';
import { type Format, validFormats } from './types/Format';

const program = new Command();

program.name('license-kit').description('Scan dependencies and check for copyleft licenses.').version(version);

program
  .command('copyleft')
  .description('Check for copyleft licenses. Exits with error if strong copyleft licenses are found.')
  .option('--error-on-weak', 'Exit with error if weak copyleft licenses are found', false)
  .option('--root <path>', 'Path to the root of your project', '.')
  .action((options) => {
    const repoRootPath = path.resolve(process.cwd(), options.root);
    const packageJsonPath = path.join(repoRootPath, 'package.json');

    if (!fs.existsSync(packageJsonPath)) {
      console.error(`package.json not found at ${packageJsonPath}`);
      process.exit(1);
    }

    const licenses = scanDependencies(packageJsonPath);

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

    if (strongCopyleftLicensesFound.length > 0) {
      console.error('❌ Copyleft licenses found in the following dependencies:');
      strongCopyleftLicensesFound.forEach((entry) => {
        console.error(entry);
      });
      process.exit(1);
    }

    if (weakCopyleftLicensesFound.length > 0) {
      console.error('⚠️ Weak copyleft licenses found in the following dependencies:');
      weakCopyleftLicensesFound.forEach((entry) => {
        console.error(entry);
      });
      if (options.errorOnWeak) {
        process.exit(1);
      }
    } else {
      console.log('✅ No copyleft licenses found');
    }
  });

program
  .command('report')
  .description('Generate a license report for your project.')
  .option('--root <path>', 'Path to the root of your project', '.')
  .option('--format <type>', "Output format: 'json', 'about-json', 'text', 'markdown'", 'json')
  .option('--output <path>', "Where to write the output: 'stdout' or a file path", 'stdout')
  .action((options) => {
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

    const licenses = scanDependencies(packageJsonPath);
    const serializedResult = serializeReport({ licenses, format: options.format as Format });

    if (options.output === 'stdout') {
      console.log(serializedResult);
    } else {
      const outputPath = path.resolve(repoRootPath, options.output);

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
