/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['jest-extended/all'],
  testPathIgnorePatterns: ['__utils__'],
};

module.exports = config;
