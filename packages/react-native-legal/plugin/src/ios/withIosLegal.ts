import { writeLicensePlistNPMOutput } from '@callstack/licenses';
import { type ConfigPlugin, withXcodeProject } from 'expo/config-plugins';

import { scanLicenses } from '../../../plugin-utils/build/common';
import type { PlatformPluginOptions } from '../types';

import { addSettingsBundle } from './addSettingsBundle';
import { registerLicensePlistBuildPhase } from './registerLicensePlistBuildPhase';

/**
 * Implementation of config plugin for iOS setup
 *
 * It scans the NPM dependencies, generates LicensePlist-compatible metadata,
 * configures Settings.bundle and registers a shell script generating LicensePlist metadata for iOS dependencies
 */
export const withIosLegal: ConfigPlugin<PlatformPluginOptions> = (config, { scanOptionsFactory, dependencySource }) => {
  withXcodeProject(config, async (exportedConfig) => {
    const licenses = await scanLicenses({
      projectRoot: exportedConfig.modRequest.projectRoot,
      platform: 'ios',
      dependencySource,
      scanOptionsFactory,
    });

    writeLicensePlistNPMOutput(licenses, exportedConfig.modRequest.platformProjectRoot);
    return exportedConfig;
  });
  config = addSettingsBundle(config);
  config = registerLicensePlistBuildPhase(config);
  return config;
};
