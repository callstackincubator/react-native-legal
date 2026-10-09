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
  const { dependencySource, additionalProjectRoots } = pluginScanOptions;

  if (androidProjectPath) {
    await androidCommand(androidProjectPath, { scanOptionsFactory, dependencySource, additionalProjectRoots });
  }

  if (iosProjectPath) {
    await iosCommand(iosProjectPath, { scanOptionsFactory, dependencySource, additionalProjectRoots });
  }
}

export default generateLegal;
