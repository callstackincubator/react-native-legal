import { LicenseCategory } from './LicenseCategory';

export function getPermissivenessScoreDescription(score: number): string {
  if (score >= 80) return 'Highly Permissive';
  if (score >= 60) return 'Moderately Permissive';
  if (score >= 40) return 'Mixed Permissiveness';
  return 'Restrictive';
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
