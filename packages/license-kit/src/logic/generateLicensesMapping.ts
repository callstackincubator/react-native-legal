import fs from 'node:fs';

import { type Types, scanDependencies } from '@callstack/licenses';

import { createScanOptionsFactory } from '../scanOptionsUtils';
import type { CLIVisualizeOptions } from '../types/CLIOptions';
import { getProjectPaths } from '../utils/projectUtils';

export type LicensesMappingResult = {
  licenses: Types.AggregatedLicensesMapping;
  repoRootPath: string;
  projectName: string;
};

export function generateLicensesMapping(options: CLIVisualizeOptions) {
  const { packageJsonPath, repoRootPath } = getProjectPaths(options);

  const projectName = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8')).name;

  return {
    licenses: scanDependencies(packageJsonPath, createScanOptionsFactory(options)),
    repoRootPath,
    projectName,
  };
}
