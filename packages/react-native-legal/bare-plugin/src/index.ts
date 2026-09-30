import { createPluginScanOptionsFactory } from '../../plugin-utils/build/common';
import type { PluginScanOptions } from '../../plugin-utils/build/types';

import { androidCommand } from './android/androidCommand';
import { iosCommand } from './ios/iosCommand';

async function generateLegal(
  androidProjectPath: string | undefined,
  iosProjectPath: string | undefined,
  pluginScanOptions: PluginScanOptions,
) {
  const scanOptionsFactory = createPluginScanOptionsFactory(pluginScanOptions);

  if (androidProjectPath) {
    await androidCommand(androidProjectPath, scanOptionsFactory, pluginScanOptions.dependencySource);
  }

  if (iosProjectPath) {
    await iosCommand(iosProjectPath, scanOptionsFactory, pluginScanOptions.dependencySource);
  }
}


export default generateLegal;
