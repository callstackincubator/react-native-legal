const path = require('path');

const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  watchFolders: [path.join(__dirname, '../../node_modules'), path.join(__dirname, '../react-native-legal')],
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
