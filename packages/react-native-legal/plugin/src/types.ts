import type { Types as SharedTypes } from '@callstack/licenses';

import type { PluginScanOptions } from '../../plugin-utils/build/types';

export type PluginOptions = PluginScanOptions;

export type PlatformPluginOptions = {
  scanOptionsFactory: SharedTypes.ScanPackageOptionsFactory;
};
