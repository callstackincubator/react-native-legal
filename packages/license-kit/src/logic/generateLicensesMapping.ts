import fs from 'node:fs';

import { type Types } from '@callstack/licenses';

import type { CLIVisualizeOptions } from '../types/CLIOptions';
import { getProjectPaths } from '../utils/projectUtils';

import { scanLicenses } from './scanLicenses';

export type LicensesMappingResult = {
  licenses: Types.AggregatedLicensesMapping;
  repoRootPath: string;
  projectName: string;
};

export function generateLicensesMapping(options: CLIVisualizeOptions) {
  const { packageJsonPath, repoRootPath } = getProjectPaths(options);

  const projectName = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8')).name;

  return {
    licenses: scanLicenses(packageJsonPath, options),
    repoRootPath,
    projectName,
  };
}
