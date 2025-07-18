import type { LicenseCategory } from '../permissiveness/LicenseCategory';

export interface LicenseStats {
  total: number;
  byCategory: Record<LicenseCategory, number>;
  byLicense: Record<string, number>;
  permissivenessScore: number;
}
