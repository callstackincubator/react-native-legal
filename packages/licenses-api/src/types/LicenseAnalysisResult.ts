import type { LicenseCategory } from '../permissiveness/LicenseCategory';

import type { LicenseStats } from './LicenseStats';

export interface LicenseAnalysisResult extends LicenseStats {
  categorizedLicenses: Record<string, LicenseCategory>;
}
