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
  const { additionalProjectRoots } = pluginScanOptions;

  if (androidProjectPath) {
    androidCommand(androidProjectPath, { scanOptionsFactory, additionalProjectRoots });
  }

  if (iosProjectPath) {
    iosCommand(iosProjectPath, { scanOptionsFactory, additionalProjectRoots });
  }
}

export default generateLegal;
