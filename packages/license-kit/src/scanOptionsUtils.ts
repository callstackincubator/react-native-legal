import { type Types as SharedTypes } from '@callstack/licenses';

import type { CLIScanOptions } from './types/CLIOptions';

export const createScanOptionsFactory =
  (cliScanOptions: CLIScanOptions): SharedTypes.ScanPackageOptionsFactory =>
  ({ isRoot, isWorkspacePackage }) => {
    let includeDevDependencies = false;

    switch (cliScanOptions.devDepsMode) {
      case 'root-only':
        includeDevDependencies = isRoot;
        break;

      case 'none':
        includeDevDependencies = false;
        break;
    }

    let includeTransitiveDependencies = true;

    switch (cliScanOptions.transitiveDepsMode) {
      case 'all':
        includeTransitiveDependencies = true;
        break;

      case 'from-external-only':
        includeTransitiveDependencies = !isWorkspacePackage;
        break;

      case 'from-workspace-only':
        includeTransitiveDependencies = isWorkspacePackage;
        break;

      case 'none':
        includeTransitiveDependencies = false;
        break;
    }

    const includeOptionalDependencies = cliScanOptions.includeOptionalDeps;

    return {
      includeDevDependencies,
      includeTransitiveDependencies,
      includeOptionalDependencies,
    };
  };
