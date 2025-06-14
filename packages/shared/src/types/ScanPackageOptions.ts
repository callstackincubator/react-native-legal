/**
 * Scan options for controlling which dependencies of a package are scanned
 */
export type ScanPackageOptions = {
  /** Whether transitive dependencies should be scanned */
  includeTransitiveDependencies: boolean;

  /** Whether to include devDependencies in the scan; include*Transitive* options apply */
  includeDevDependencies: boolean;
};

/**
 * Information about a single package to be scanned
 */
export type ScanPackageOptionsFactoryPackageInfo = {
  /** `true` if the analyzed package.json is the root of the scanned project */
  isRoot: boolean;

  /** `true` if the analyzed package.json is a dependency related to the project via a `workspace:...` dependency specifier */
  isWorkspacePackage: boolean;
};

/**
 * Factory to create a filter for scan options for dependencies of a given package
 */
export type ScanPackageOptionsFactory = (packageInfo: ScanPackageOptionsFactoryPackageInfo) => ScanPackageOptions;

/**
 * Default value consistent with legacy behaviour assumptions for the scan package options factory
 * used so as not to introduce breaking API changes to the shared package
 */
export const legacyDefaultScanPackageOptionsFactory: ScanPackageOptionsFactory = () => ({
  includeTransitiveDependencies: true,
  includeDevDependencies: false,
});
