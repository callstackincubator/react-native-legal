import { LicenseCategory } from './LicenseCategory';

export const PERMISSIVENESS_SCORE_WEIGHTS = {
  [LicenseCategory.PERMISSIVE]: 100,
  [LicenseCategory.WEAK_COPYLEFT]: 60,
  [LicenseCategory.STRONG_COPYLEFT]: 20,
  [LicenseCategory.UNKNOWN]: 10,
};
