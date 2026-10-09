import type { AggregatedLicensesMapping } from '../types';

import { MiscUtils } from './utils';

/**
 * Combines licenses mappings, e.g. from scans of several project roots, into one.
 *
 * @param mappings Licenses mappings to combine; a package version present in several of them keeps the entry from the first one, with the parent packages of all of them
 * @returns A new licenses mapping that shares no objects with the mappings passed in
 */
export function mergeLicensesMappings(...mappings: AggregatedLicensesMapping[]): AggregatedLicensesMapping {
  const result: AggregatedLicensesMapping = {};

  for (const mapping of mappings) {
    for (const [packageKey, license] of Object.entries(mapping)) {
      const existingLicense = result[packageKey];

      if (!existingLicense) {
        result[packageKey] = structuredClone({ ...license, parentPackages: license.parentPackages ?? [] });
        continue;
      }

      for (const parentPackage of license.parentPackages ?? []) {
        if (!MiscUtils.arrayIncludesObject(existingLicense.parentPackages, parentPackage)) {
          existingLicense.parentPackages.push(structuredClone(parentPackage));
        }
      }
    }
  }

  return result;
}
