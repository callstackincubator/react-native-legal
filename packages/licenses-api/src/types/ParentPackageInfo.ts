export type ParentPackageInfo = {
  /**
   * The name of the package
   */
  name: string;

  /**
   * The required version, as specified in package.json
   */
  requiredVersion: string;

  /**
   * The resolved version, as specified in package.json
   */
  resolvedVersion: string;
};
