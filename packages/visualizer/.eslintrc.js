/** @type {import("eslint").Linter.Config} */
var config = {
  root: true,
  extends: [
    'plugin:prettier/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/typescript',
    'plugin:react-hooks/recommended-legacy',
    '../../.eslintrc.js',
  ],
  rules: {
    'react-native/no-raw-text': 'off',
    'prettier/prettier': 'error',
    'import/no-unresolved': 'off',
  },
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'import'],
  settings: {
    'import/resolver': {
      typescript: {
        project: './tsconfig.json',
      },
    },
  },
};

module.exports = config;
