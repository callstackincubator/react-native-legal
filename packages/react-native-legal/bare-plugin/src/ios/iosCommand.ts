import path from 'node:path';

import { writeLicensePlistNPMOutput } from '@callstack/licenses';

import type { PluginLicensesScanner } from '../../../plugin-utils/build/types';

import { addSettingsBundle } from './addSettingsBundle';
import { registerLicensePlistBuildPhase } from './registerLicensePlistBuildPhase';

/**
 * Implementation of bare plugin's iOS/tvOS setup
 *
 * It scans the NPM dependencies, generates LicensePlist-compatible metadata for them,
 * configures Settings.bundle and registers a shell script generating LicensePlist metadata for iOS dependencies
 */
export function iosCommand(iosProjectPath: string, scanLicenses: PluginLicensesScanner) {
  const licenses = scanLicenses(path.join(path.resolve(iosProjectPath, '..'), 'package.json'), 'ios');

  writeLicensePlistNPMOutput(licenses, iosProjectPath);

  addSettingsBundle(iosProjectPath);
  registerLicensePlistBuildPhase(iosProjectPath);
}
