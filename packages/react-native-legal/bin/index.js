#!/usr/bin/env node
const process = require('node:process');

// eslint-disable-next-line import/no-extraneous-dependencies
const { Command } = require('commander');

const { version } = require('../package.json');

const generateLegal = require('./commands/legal-generate');

const program = new Command();

program.name('react-native-legal For Web').description('Scan dependencies for Web projects').version(version);

generateLegal(program);

program
  .command('help', { isDefault: false })
  .description('Show help message')
  .action(() => {
    program.outputHelp();
  });

if (!process.argv.slice(2).length) {
  program.outputHelp();
} else {
  program.parse(process.argv);
}
