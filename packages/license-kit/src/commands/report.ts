import fs from 'node:fs';
import path from 'node:path';

import { scanDependencies } from '@callstack/licenses';
import type { Command } from 'commander';

import { createScanOptionsFactory } from '../scanOptionsUtils';
import { serializeReport } from '../serializeReport';
import { type Format, validFormats } from '../types/Format';
import type { Output } from '../types/Output';
import { curryCommonScanOptions, curryReportOptions, validateCommonScanOptions } from '../utils/commandUtils';

export default function reportCommandSetup(program: Command): Command {
  return curryCommonScanOptions(
    curryReportOptions(program.command('report').description('Generate a license report for your project.')),
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
}
