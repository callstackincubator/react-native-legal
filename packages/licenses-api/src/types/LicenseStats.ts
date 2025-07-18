import type { LicenseCategory } from '../permissiveness/LicenseCategory';

export type WeightedSumComponents = Partial<
  Record<
    LicenseCategory,
    {
      weight: number;
      count: number;
    }
  >
>;

export interface LicenseStats {
  total: number;
  byCategory: Record<LicenseCategory, number>;
  byLicense: Record<string, number>;
  permissiveness: {
    score: number;
    weightedSumComponents: WeightedSumComponents;
  };
}
