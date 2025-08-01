import fs from 'node:fs';
import path from 'node:path';

import type { Command } from 'commander';

import { generateLicensesMapping } from '../logic/generateLicensesMapping';
import { serializeReport } from '../serializeReport';
import { type Format } from '../types/Format';
import type { Output } from '../types/Output';
import {
  curryCommonScanOptions,
  curryReportOptions,
  validateCommonReportOptions,
  validateCommonScanOptions,
} from '../utils/commandUtils';

export default function reportCommandSetup(program: Command): Command {
  return curryCommonScanOptions(
    curryReportOptions(program.command('report').description('Generate a license report for your project.')),
  ).action((options) => {
    validateCommonScanOptions(options);
    validateCommonReportOptions(options);

    const { licenses, repoRootPath } = generateLicensesMapping(options);

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
