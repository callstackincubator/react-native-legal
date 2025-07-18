import { STRONG_COPYLEFT_LICENSES_LOWERCASE, WEAK_COPYLEFT_LICENSES_LOWERCASE } from '../constants/licenses';
import type { AggregatedLicensesMapping, LicenseStats, WeightedSumComponents } from '../types';
import type { LicenseAnalysisResult } from '../types/LicenseAnalysisResult';

import { LicenseCategory } from './LicenseCategory';
import { PERMISSIVENESS_SCORE_WEIGHTS } from './constants';

/**
 * Categorizes a license based on its copyleft characteristics.
 * @param licenseType the license type
 * @returns the license category
 */
export function categorizeLicense(licenseType?: string): LicenseCategory {
  if (!licenseType) {
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
 * Calculates a permissiveness score (0-100) based on license distribution. A higher score means more permissive licenses.
 * @param stats the license stats
 * @returns the permissiveness score
 */
export function calculatePermissivenessScore(stats: Record<LicenseCategory, number>): LicenseStats['permissiveness'] {
  const total = Object.values(stats).reduce((sum, count) => sum + count, 0);

  if (total === 0) {
    return {
      score: 0,
      totalSum: 0,
      weightedSumComponents: {},
    };
  }

  const weightedSumComponents: WeightedSumComponents = {};

  const weightedSum = Object.entries(stats).reduce((sum, [category, count]) => {
    const weight = PERMISSIVENESS_SCORE_WEIGHTS[category as keyof typeof PERMISSIVENESS_SCORE_WEIGHTS];

    weightedSumComponents[category as LicenseCategory] = {
      weight,
      count,
    };

    return sum + weight * count;
  }, 0);

  return {
    score: Math.floor(weightedSum / total),
    totalSum: total,
    weightedSumComponents: Object.entries(stats).reduce(
      (sum, [category, count]) => ({
        ...sum,
        [category]: {
          weight: PERMISSIVENESS_SCORE_WEIGHTS[category as keyof typeof PERMISSIVENESS_SCORE_WEIGHTS],
          count,
        },
      }),
      {},
    ),
  };
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

  return {
    total,
    byCategory,
    byLicense,
    permissiveness: calculatePermissivenessScore(byCategory),
    categorizedLicenses,
  };
}
