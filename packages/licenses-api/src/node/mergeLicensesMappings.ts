import type { AggregatedLicensesMapping } from '../types';

import { MiscUtils } from './utils';

export function mergeLicensesMappings(...mappings: AggregatedLicensesMapping[]): AggregatedLicensesMapping {
  const result: AggregatedLicensesMapping = {};

  for (const mapping of mappings) {
    for (const [packageKey, license] of Object.entries(mapping)) {
      const existingLicense = result[packageKey];

      if (!existingLicense) {
        result[packageKey] = { ...license, parentPackages: [...(license.parentPackages ?? [])] };
        continue;
      }

      for (const parentPackage of license.parentPackages ?? []) {
        if (!MiscUtils.arrayIncludesObject(existingLicense.parentPackages, parentPackage)) {
          existingLicense.parentPackages.push(parentPackage);
        }
      }
    }
  }

  return result;
}
