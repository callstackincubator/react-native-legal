import path from 'node:path';

import { scanDependencies, writeLicensePlistNPMOutput } from '@callstack/licenses';

import { addSettingsBundle } from './addSettingsBundle';
import { registerLicensePlistBuildPhase } from './registerLicensePlistBuildPhase';

/**
 * Implementation of bare plugin's iOS/tvOS setup
 *
 * It scans the NPM dependencies, generates LicensePlist-compatible metadata for them,
 * configures Settings.bundle and registers a shell script generating LicensePlist metadata for iOS dependencies
 */
export function iosCommand(iosProjectPath: string) {
  const licenses = scanDependencies(path.join(path.resolve(iosProjectPath, '..'), 'package.json'));

  writeLicensePlistNPMOutput(licenses, iosProjectPath);

  addSettingsBundle(iosProjectPath);
  registerLicensePlistBuildPhase(iosProjectPath);
}
