import type { Types as SharedTypes } from '@callstack/licenses';

import type {
  AboutLibrariesOptions,
  LicensePlistOptions,
  PluginOptions as SharedPluginOptions,
} from '../../plugin-utils/build/types';

export type PluginOptions = SharedPluginOptions;

export type PlatformPluginOptions = {
  scanOptionsFactory: SharedTypes.ScanPackageOptionsFactory;
  aboutLibraries?: AboutLibrariesOptions;
  licensePlist?: LicensePlistOptions;
};
