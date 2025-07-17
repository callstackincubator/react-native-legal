import type { Types } from '@callstack/licenses';
import { STRONG_COPYLEFT_LICENSES, WEAK_COPYLEFT_LICENSES } from '../../../src/constants';
import { LicenseCategory } from '@/types/LicenseCategory';
import { LicenseAnalysisResult } from '@/types/LicenseAnalysisResult';
import { PERMISSIVENESS_SCORE_WEIGHTS } from '@/constants';

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
  if (STRONG_COPYLEFT_LICENSES.has(licenseType)) {
    return LicenseCategory.STRONG_COPYLEFT;
  }

  // check for weak copyleft licenses
  if (WEAK_COPYLEFT_LICENSES.has(licenseType)) {
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
export function calculatePermissivenessScore(stats: Record<LicenseCategory, number>): number {
  const total = Object.values(stats).reduce((sum, count) => sum + count, 0);

  if (total === 0) return 0;

  const weightedSum = Object.entries(stats).reduce(
    (sum, [category, count]) =>
      sum + PERMISSIVENESS_SCORE_WEIGHTS[category as keyof typeof PERMISSIVENESS_SCORE_WEIGHTS] * count,
    0,
  );

  return Math.floor(weightedSum / total);
}

/**
 * Analyzes license data and returns comprehensive statistics.
 * @param report the licenses report data
 * @returns the license analysis result
 */
export function analyzeLicenses(report: Types.AggregatedLicensesMapping): LicenseAnalysisResult {
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
  const permissivenessScore = calculatePermissivenessScore(byCategory);

  return {
    total,
    byCategory,
    byLicense,
    permissivenessScore,
    categorizedLicenses,
  };
}

/**
 * Gets a human-readable description of the license category
 * @param category the license category
 * @returns the human-readable description of the license category
 */
export function getLicenseCategoryDescription(category: LicenseCategory): string {
  switch (category) {
    case LicenseCategory.STRONG_COPYLEFT:
      return 'Strong Copyleft';

    case LicenseCategory.WEAK_COPYLEFT:
      return 'Weak Copyleft';

    case LicenseCategory.PERMISSIVE:
      return 'Permissive';

    case LicenseCategory.UNKNOWN:
      return 'Unknown';
  }
}
