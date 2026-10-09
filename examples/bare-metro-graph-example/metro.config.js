const path = require('path');

const { getDefaultConfig } = require('@react-native/metro-config');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Add the workspace root as a watch folder
config.watchFolders = [workspaceRoot];

// Configure workspace package resolution
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Add workspace packages to resolver
config.resolver.disableHierarchicalLookup = true;
config.resolver.nodeModulesPaths = [...config.resolver.nodeModulesPaths, path.resolve(workspaceRoot, 'packages')];

module.exports = config;
