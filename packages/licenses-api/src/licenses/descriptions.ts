import { LicenseCategory } from './LicenseCategory';

export function getGraphStateInfo(stats: Record<LicenseCategory, number>) {
  const hasAnyUnknown = stats[LicenseCategory.UNKNOWN] > 0;
  const hasAnyWeakCopyleft = stats[LicenseCategory.WEAK_COPYLEFT] > 0;
  const hasAnyStrongCopyleft = stats[LicenseCategory.STRONG_COPYLEFT] > 0;
  const hasAllPermissive = !hasAnyUnknown && !hasAnyStrongCopyleft && !hasAnyWeakCopyleft;

  let description = '';
  if (hasAnyWeakCopyleft || hasAnyStrongCopyleft) {
    description = `Some detected licenses are ${[
      hasAnyWeakCopyleft ? 'weak' : null,
      hasAnyStrongCopyleft ? 'strong' : null,
    ]
      .filter((x) => !!x)
      .map((x) => `${x}-`)
      .join(' and ')}copyleft`;
  } else {
    description = `${hasAllPermissive ? 'All' : stats[LicenseCategory.PERMISSIVE]} detected licenses are permissive`;
  }

  if (hasAnyUnknown) {
    description += `, ${hasAllPermissive ? 'but ' : ''}${stats[LicenseCategory.UNKNOWN]} are unknown.`;
  }

  return {
    description,
    categoriesPresence: {
      hasAnyUnknown,
      hasAnyWeakCopyleft,
      hasAnyStrongCopyleft,
      hasAllPermissive,
    },
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
