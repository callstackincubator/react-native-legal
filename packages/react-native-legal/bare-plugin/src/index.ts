import { createPluginLicensesScanner } from '../../plugin-utils/build/common';
import type { PluginScanOptions } from '../../plugin-utils/build/types';

import { androidCommand } from './android/androidCommand';
import { iosCommand } from './ios/iosCommand';

function generateLegal(
  androidProjectPath: string | undefined,
  iosProjectPath: string | undefined,
  pluginScanOptions: PluginScanOptions,
) {
  const scanLicenses = createPluginLicensesScanner(pluginScanOptions);

  if (androidProjectPath) {
    androidCommand(androidProjectPath, scanLicenses);
  }

  if (iosProjectPath) {
    iosCommand(iosProjectPath, scanLicenses);
  }
}

export default generateLegal;
