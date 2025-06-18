import type { AboutLibrariesLibraryJsonPayload } from './AboutLibrariesLibraryJsonPayload';
import type { AboutLibrariesLicenseJsonPayload } from './AboutLibrariesLicenseJsonPayload';

export type AboutLibrariesLikePackageInfo = {
  normalizedPackageName: string;
  libraryJsonPayload: AboutLibrariesLibraryJsonPayload;
  licenseJsonPayload: AboutLibrariesLicenseJsonPayload;
};
