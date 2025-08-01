import type { LicenseCategory } from '../permissiveness/LicenseCategory';

export type WeightedSumComponents = Partial<
  Record<
    LicenseCategory,
    {
      /**
       * The weight of the license category in the permissiveness score
       */
      weight: number;

      /**
       * The count of packages in the license category
       */
      count: number;
    }
  >
>;

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

  permissiveness: {
    /**
     * The normalized score in range [0, 1], being a weighted average of counts in respective categories
     */
    score: number;

    /**
     * The total count of packages
     */
    totalCount: number;

    /**
     * Mapping of license category to weighted component data
     */
    weightedSumComponents: WeightedSumComponents;
  };
}
