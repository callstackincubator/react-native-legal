import { LicenseCategory } from './LicenseCategory';
import { LicenseStats } from './LicenseStats';

export interface LicenseAnalysisResult extends LicenseStats {
  categorizedLicenses: Record<string, LicenseCategory>;
}
