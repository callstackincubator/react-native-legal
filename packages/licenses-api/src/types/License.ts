import type { DependencyType } from './DependencyType';
import type { ParentPackageInfo } from './ParentPackageInfo';
import type { ScanPackageCallContext } from './ScanPackageCallContext';

export type License = {
  /** Package name */
  name: string;

  /** Package author */
  author?: string;

  /** Package license contents */
  content?: string;

  /** Package description */
  description?: string;

  /** License file path */
  file?: string;

  /** License type */
  type?: string;

  /** Package repository URL */
  url?: string;

  /** The resolved version that was actually installed */
  version: string;

  /** The source of how this package has been introduced to the dependency tree */
  dependencyType: DependencyType;

  /** The required version specified in package.json */
  requiredVersion: string;

  /**
   * The name(s) of the package(s) that introduced the package as a dependency (of any type);
   * empty array if the package is a dependency of the root package
   */
  parentPackages: ParentPackageInfo[];
} & Pick<ScanPackageCallContext, 'parentPackageRequiredVersion' | 'parentPackageResolvedVersion'>;
