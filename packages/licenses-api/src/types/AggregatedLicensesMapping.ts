import type { License } from './License';

/**
 * Mapping from package keys in format `<package-name>@<package-version>` to license objects.
 * @see {@link License}
 */
export type AggregatedLicensesMapping = Record<string, License>;
