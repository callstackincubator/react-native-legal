import type { ConfigPlugin } from 'expo/config-plugins';
import { createRunOncePlugin } from 'expo/config-plugins';

import { createPluginScanOptionsFactory, resolvePluginScanOptions } from '../../plugin-utils/build/common';

import { withAndroidLegal } from './android/withAndroidLegal';
import { withIosLegal } from './ios/withIosLegal';
import type { PluginOptions } from './types';

// eslint-disable-next-line import/no-extraneous-dependencies
const pak = require('react-native-legal/package.json');

const withReactNativeLegal: ConfigPlugin<PluginOptions> = (config, options) => {
  // validates the raw options, before the defaults are assigned
  const pluginScanOptions = resolvePluginScanOptions(options);
  const { dependencySource } = pluginScanOptions;

  const scanOptionsFactory = createPluginScanOptionsFactory(pluginScanOptions);

  config = withAndroidLegal(config, { scanOptionsFactory, dependencySource });
  config = withIosLegal(config, { scanOptionsFactory, dependencySource });

  return config;
};

export default createRunOncePlugin(withReactNativeLegal, pak.name, pak.version);
