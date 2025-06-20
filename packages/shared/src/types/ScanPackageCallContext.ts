import type { DependencyType } from './DependencyType';

export type ScanPackageCallContext = {
  /** Information on what is the source of the dependency on the package to be scanned */
  dependencyType: DependencyType;

  /**
   * The name of the package that introduced the package to be scanned as a dependency (of any type);
   * undefined if the package to be scanned is a dependency of the root package
   */
  parentPackageName?: string;

  /**
   * The installation directory of the package that introduced the package to be scanned as a dependency (of any type);
   * undefined if the package to be scanned is a dependency of the root package
   */
  parentPackageRoot?: string;

  /**
   * The required version, as specified in package.json
   * of the package that introduced the package to be scanned as a dependency (of any type)
   */
  parentPackageRequiredVersion?: string;

  /**
   * The resolved (actually installed by the package manager) version
   * of the package that introduced the package to be scanned as a dependency (of any type)
   */
  parentPackageResolvedVersion?: string;
};
