import path from 'path';

import { scanDependencies, writeLicensePlistNPMOutput } from '@callstack/licenses';
import { type ConfigPlugin, withXcodeProject } from 'expo/config-plugins';

import { addSettingsBundle } from './addSettingsBundle';
import { registerLicensePlistBuildPhase } from './registerLicensePlistBuildPhase';

/**
 * Implementation of config plugin for iOS setup
 *
 * It scans the NPM dependencies, generates LicensePlist-compatible metadata,
 * configures Settings.bundle and registers a shell script generating LicensePlist metadata for iOS dependencies
 */
export const withIosLegal: ConfigPlugin = (config) => {
  withXcodeProject(config, async (exportedConfig) => {
    const licenses = scanDependencies(path.join(exportedConfig.modRequest.projectRoot, 'package.json'));

    writeLicensePlistNPMOutput(licenses, exportedConfig.modRequest.platformProjectRoot);
    return exportedConfig;
  });
  config = addSettingsBundle(config);
  config = registerLicensePlistBuildPhase(config);
  return config;
};
