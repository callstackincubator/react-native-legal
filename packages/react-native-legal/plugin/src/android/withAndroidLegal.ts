import path from 'node:path';

import { scanDependencies, writeAboutLibrariesNPMOutput } from '@callstack/licenses';
import { type ConfigPlugin, withAndroidManifest } from 'expo/config-plugins';

import { addListActivity } from './addListActivity';
import { applyAndConfigureAboutLibrariesPlugin } from './applyAndConfigureAboutLibrariesPlugin';
import { declareAboutLibrariesPlugin } from './declareAboutLibrariesPlugin';

/**
 * Implementation of config plugin for Android setup
 *
 * It scans the NPM dependencies, generates AboutLibraries-compatible metadata,
 * installs & configures AboutLibraries Gradle plugin and adds Android Activity with a list of dependencies and their licenses
 */
export const withAndroidLegal: ConfigPlugin = (config) => {
  withAndroidManifest(config, async (exportedConfig) => {
    const licenses = scanDependencies(path.join(exportedConfig.modRequest.projectRoot, 'package.json'));

    writeAboutLibrariesNPMOutput(licenses, exportedConfig.modRequest.platformProjectRoot);
    return exportedConfig;
  });
  config = declareAboutLibrariesPlugin(config);
  config = applyAndConfigureAboutLibrariesPlugin(config);
  config = addListActivity(config);
  return config;
};
