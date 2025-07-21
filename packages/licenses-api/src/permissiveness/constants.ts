import { LicenseCategory } from './LicenseCategory';

export const PERMISSIVENESS_SCORE_WEIGHTS = {
  [LicenseCategory.PERMISSIVE]: 50,
  [LicenseCategory.WEAK_COPYLEFT]: 20,
  [LicenseCategory.STRONG_COPYLEFT]: 0,
  [LicenseCategory.UNKNOWN]: 30,
};
