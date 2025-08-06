import { STRONG_COPYLEFT_LICENSES_LOWERCASE, WEAK_COPYLEFT_LICENSES_LOWERCASE } from '../constants/licenses';
import type { AggregatedLicensesMapping } from '../types';
import type { LicenseAnalysisResult } from '../types/LicenseAnalysisResult';

import { LicenseCategory } from './LicenseCategory';
import { getGraphStateInfo } from './descriptions';

/**
 * Categorizes a license based on its copyleft characteristics.
 * @param licenseType the license type
 * @returns the license category
 */
export function categorizeLicense(licenseType?: string): LicenseCategory {
  if (!licenseType || licenseType === 'unknown') {
    return LicenseCategory.UNKNOWN;
  }

  // check for strong copyleft licenses
  if (STRONG_COPYLEFT_LICENSES_LOWERCASE.has(licenseType.toLowerCase())) {
    return LicenseCategory.STRONG_COPYLEFT;
  }

  // check for weak copyleft licenses
  if (WEAK_COPYLEFT_LICENSES_LOWERCASE.has(licenseType.toLowerCase())) {
    return LicenseCategory.WEAK_COPYLEFT;
  }

  // everything else is considered permissive
  return LicenseCategory.PERMISSIVE;
}

/**
 * Analyzes license data and returns comprehensive statistics.
 * @param report the licenses report data
 * @returns the license analysis result
 */
export function analyzeLicenses(report: AggregatedLicensesMapping): LicenseAnalysisResult {
  const byCategory: Record<LicenseCategory, number> = {
    [LicenseCategory.STRONG_COPYLEFT]: 0,
    [LicenseCategory.WEAK_COPYLEFT]: 0,
    [LicenseCategory.PERMISSIVE]: 0,
    [LicenseCategory.UNKNOWN]: 0,
  };

  const byLicense: Record<string, number> = {};
  const categorizedLicenses: Record<string, LicenseCategory> = {};

  Object.entries(report).forEach(([packageKey, license]) => {
    const licenseType = license.type;
    const category = categorizeLicense(licenseType);

    // stats by category
    byCategory[category]++;

    // stats by specific license
    {
      const key = licenseType ?? 'unknown';

      byLicense[key] = (byLicense[key] ?? 0) + 1;
    }

    // memoization for lookup
    categorizedLicenses[packageKey] = category;
  });

  const total = Object.keys(report).length;

  const { categoriesPresence, description } = getGraphStateInfo(byCategory);

  return {
    total,
    byCategory,
    byLicense,
    description,
    categoriesPresence,
    categorizedLicenses,
  };
}
