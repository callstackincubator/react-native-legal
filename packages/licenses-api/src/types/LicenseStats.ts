import type { LicenseCategory } from '../licenses/LicenseCategory';

export interface LicenseStats {
  /**
   * Total number of packages
   */
  total: number;

  /**
   * Mapping of license category to count of packages in that category
   */
  byCategory: Record<LicenseCategory, number>;

  /**
   * Mapping of license name to count of packages with that license
   */
  byLicense: Record<string, number>;

  /**
   * Information about the presence of different license categories
   */
  categoriesPresence: {
    hasAnyUnknown: boolean;
    hasAnyWeakCopyleft: boolean;
    hasAnyStrongCopyleft: boolean;
    hasAllPermissive: boolean;
  };

  /**
   * Description of the graph state based on the license categories
   */
  description: string;
}
