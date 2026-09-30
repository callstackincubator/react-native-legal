import type { Types as SharedTypes } from '@callstack/licenses';

import type { DependencySource, PluginScanOptions } from '../../plugin-utils/build/types';

export type PlatformPluginOptions = {
  scanOptionsFactory: SharedTypes.ScanPackageOptionsFactory;
  dependencySource: DependencySource;
};
export type PluginOptions = PluginScanOptions;
