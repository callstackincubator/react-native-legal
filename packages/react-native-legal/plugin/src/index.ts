import type { ConfigPlugin } from 'expo/config-plugins';
import { createRunOncePlugin } from 'expo/config-plugins';

import { createPluginScanOptionsFactory } from '../../plugin-utils/build/common';
import type { PluginScanOptions } from '../../plugin-utils/build/types';

import { withAndroidLegal } from './android/withAndroidLegal';
import { withIosLegal } from './ios/withIosLegal';
import type { PluginOptions } from './types';

// eslint-disable-next-line import/no-extraneous-dependencies
const pak = require('react-native-legal/package.json');

const withReactNativeLegal: ConfigPlugin<PluginOptions> = (config, options) => {
  const {
    devDepsMode = 'none',
    includeOptionalDeps = true,
    transitiveDepsMode = 'all',
    aboutLibraries,
    licensePlist,
  } = options ?? {};
  const pluginScanOptions: PluginScanOptions = { devDepsMode, includeOptionalDeps, transitiveDepsMode };
  const scanOptionsFactory = createPluginScanOptionsFactory(pluginScanOptions);

  config = withAndroidLegal(config, { scanOptionsFactory, aboutLibraries });
  config = withIosLegal(config, { scanOptionsFactory, licensePlist });

  return config;
};

export default createRunOncePlugin(withReactNativeLegal, pak.name, pak.version);
