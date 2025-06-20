import type { LicenseObj } from './LicenseObj';

/**
 * Mapping from package keys in format `<package-name>/<package-version>` to license objects.
 * @see {@link LicenseObj}
 */
export type AggregatedLicensesObj = Record<string, LicenseObj>;
