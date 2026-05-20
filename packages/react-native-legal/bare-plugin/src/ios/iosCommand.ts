import path from 'node:path';

import { type Types as SharedTypes, scanDependencies, writeLicensePlistNPMOutput } from '@callstack/licenses';

import type { LicensePlistOptions } from '../../../plugin-utils/build/types';

import { addSettingsBundle } from './addSettingsBundle';
import { registerLicensePlistBuildPhase } from './registerLicensePlistBuildPhase';

/**
 * Implementation of bare plugin's iOS/tvOS setup
 *
 * It scans the NPM dependencies, generates LicensePlist-compatible metadata for them,
 * configures Settings.bundle and registers a shell script generating LicensePlist metadata for iOS dependencies
 */
export function iosCommand(
  iosProjectPath: string,
  scanOptionsFactory: SharedTypes.ScanPackageOptionsFactory,
  licensePlist?: LicensePlistOptions,
) {
  const licenses = scanDependencies(path.join(path.resolve(iosProjectPath, '..'), 'package.json'), scanOptionsFactory);

  writeLicensePlistNPMOutput(licenses, iosProjectPath);

  addSettingsBundle(iosProjectPath);
  registerLicensePlistBuildPhase(iosProjectPath, licensePlist);
}
