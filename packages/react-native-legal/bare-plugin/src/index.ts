import { createPluginScanOptionsFactory } from '../../plugin-utils/build/common';
import type { PluginOptions, PluginScanOptions } from '../../plugin-utils/build/types';

import { androidCommand } from './android/androidCommand';
import { iosCommand } from './ios/iosCommand';

function generateLegal(
  androidProjectPath: string | undefined,
  iosProjectPath: string | undefined,
  pluginOptions: PluginOptions,
) {
  const { aboutLibraries, licensePlist, ...scanOptions } = pluginOptions;
  const pluginScanOptions: PluginScanOptions = scanOptions;
  const scanOptionsFactory = createPluginScanOptionsFactory(pluginScanOptions);

  if (androidProjectPath) {
    androidCommand(androidProjectPath, scanOptionsFactory, aboutLibraries);
  }

  if (iosProjectPath) {
    iosCommand(iosProjectPath, scanOptionsFactory, licensePlist);
  }
}

export default generateLegal;
