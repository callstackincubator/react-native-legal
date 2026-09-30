import path from 'node:path';

import { type Types as SharedTypes, writeLicensePlistNPMOutput } from '@callstack/licenses';

import { scanLicenses } from '../../../plugin-utils/build/common';
import type { DependencySource } from '../../../plugin-utils/build/types';

import { addSettingsBundle } from './addSettingsBundle';
import { registerLicensePlistBuildPhase } from './registerLicensePlistBuildPhase';

/**
 * Implementation of bare plugin's iOS/tvOS setup
 *
 * It scans the NPM dependencies, generates LicensePlist-compatible metadata for them,
 * configures Settings.bundle and registers a shell script generating LicensePlist metadata for iOS dependencies
 */
export async function iosCommand(
  iosProjectPath: string,
  scanOptionsFactory: SharedTypes.ScanPackageOptionsFactory,
  dependencySource: DependencySource,
) {
  const licenses = await scanLicenses({
    projectRoot: path.resolve(iosProjectPath, '..'),
    platform: 'ios',
    dependencySource,
    scanOptionsFactory,
  });

  writeLicensePlistNPMOutput(licenses, iosProjectPath);

  addSettingsBundle(iosProjectPath);
  registerLicensePlistBuildPhase(iosProjectPath);
}
