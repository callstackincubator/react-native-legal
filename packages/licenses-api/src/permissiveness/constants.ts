import { LicenseCategory } from './LicenseCategory';

export const PERMISSIVENESS_SCORE_WEIGHTS = {
  [LicenseCategory.PERMISSIVE]: 50,
  [LicenseCategory.WEAK_COPYLEFT]: 40,
  [LicenseCategory.STRONG_COPYLEFT]: 30,
  [LicenseCategory.UNKNOWN]: 10,
};
