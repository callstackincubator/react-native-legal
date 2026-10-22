const path = require('path');

const { patchFixturesPackages } = require('./__utils__/utils');

/**
 * @param {import('@jest/types').Config.GlobalConfig} globalConfig
 * @param {import('@jest/types').Config.ProjectConfig} projectConfig
 */
function setup(_globalConfig, _projectConfig) {
  patchFixturesPackages(path.resolve(__dirname, '..', 'packages'), false);
}

module.exports = setup;
