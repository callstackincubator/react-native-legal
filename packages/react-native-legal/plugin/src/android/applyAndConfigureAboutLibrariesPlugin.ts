import type { ExpoConfig } from 'expo/config';
import { withAppBuildGradle } from 'expo/config-plugins';

import { applyAndConfigureAboutLibrariesPluginUtil } from '../../../plugin-utils/build/android';
import type { AboutLibrariesOptions } from '../../../plugin-utils/build/types';

/**
 * Modifies application's build.gradle with AboutLibraries plugin
 *
 * NOTE: As of now, it doesn't support build.gradle.kts (Gradle Kotlin Script)
 */
export function applyAndConfigureAboutLibrariesPlugin(config: ExpoConfig, options?: AboutLibrariesOptions): ExpoConfig {
  return withAppBuildGradle(config, (exportedConfig) => {
    if (exportedConfig.modResults.language === 'groovy') {
      exportedConfig.modResults.contents = applyAndConfigureAboutLibrariesPluginUtil(
        exportedConfig.modResults.contents,
        options,
      );
    } else {
      console.warn('Gradle Kotlin scripts are not supported yet');
    }

    return exportedConfig;
  });
}
