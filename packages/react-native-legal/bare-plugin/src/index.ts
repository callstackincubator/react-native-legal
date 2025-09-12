import { createPluginScanOptionsFactory } from '../../plugin-utils/build/common';
import type { PluginScanOptions } from '../../plugin-utils/build/types';

import { androidCommand } from './android/androidCommand';
import { iosCommand } from './ios/iosCommand';

function generateLegal(
  androidProjectPath: string | undefined,
  iosProjectPath: string | undefined,
  pluginScanOptions: PluginScanOptions,
) {
  const scanOptionsFactory = createPluginScanOptionsFactory(pluginScanOptions);

  if (androidProjectPath) {
    androidCommand(androidProjectPath, scanOptionsFactory);
  }

  if (iosProjectPath) {
    iosCommand(iosProjectPath, scanOptionsFactory);
  }
}

export default generateLegal;
