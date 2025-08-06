import type { LicenseCategory } from '../licenses/LicenseCategory';

import type { LicenseStats } from './LicenseStats';

export interface LicenseAnalysisResult extends LicenseStats {
  categorizedLicenses: Record<string, LicenseCategory>;
}
