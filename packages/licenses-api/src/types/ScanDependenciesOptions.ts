/**
 * Additional options for scanning dependencies of a project
 */
export type ScanDependenciesOptions = {
  /**
   * Paths to other project directories whose dependencies are scanned too,
   * e.g. monorepo workspaces the app does not depend on;
   * relative paths are resolved against the real directory (with symlinks resolved) of the scanned `package.json`;
   * each of them must be a directory with a `package.json`, otherwise an error is thrown
   */
  additionalProjectRoots?: readonly string[];
};
