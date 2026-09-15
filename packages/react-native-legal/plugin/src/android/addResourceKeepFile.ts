import type { ExpoConfig } from 'expo/config';
import { withDangerousMod } from 'expo/config-plugins';

import { addResourceKeepFileUtil } from '../../../plugin-utils/build/android';

/**
 * Adds a file that will keep the About Libraries json resource when resource shrinking is enabled
 */
export function addResourceKeepFile(config: ExpoConfig): ExpoConfig {
  return withDangerousMod(config, [
    'android',
    (exportedConfig) => {
      addResourceKeepFileUtil(exportedConfig.modRequest.platformProjectRoot);
      return exportedConfig;
    },
  ]);
}
