/**
 * Scan options for controlling which dependencies of a package are scanned
 */
export type ScanPackageOptions = {
  /** Whether transitive dependencies should be scanned */
  includeTransitiveDependencies: boolean;

  /** Whether to include devDependencies in the scan; includeTransitiveDependencies option applies */
  includeDevDependencies: boolean;

  /** Whether to include optionalDependencies in the scan; includeTransitiveDependencies option applies */
  includeOptionalDependencies: boolean;
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
