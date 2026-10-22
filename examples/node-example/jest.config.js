/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['jest-extended/all'],
  testPathIgnorePatterns: ['__utils__'],
  globalSetup: './jest-setup.js',
  globalTeardown: './jest-teardown.js',
};

module.exports = config;
