/** @type {import("prettier").Options} */
const config = {
  arrowParens: 'always',
  bracketSameLine: false,
  bracketSpacing: true,
  printWidth: 120,
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'all',
  importOrder: ['^node:.*$', '^[@a-zA-Z]', '^(?![./])', '^\\.\\./.*', '^\\./.*'],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  plugins: ['@trivago/prettier-plugin-sort-imports'],
};

module.exports = config;
