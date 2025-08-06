#!/usr/bin/env node
import process from 'node:process';

import { Command } from 'commander';

import { version } from '../package.json';

import analyzeCommandSetup from './commands/analyze';
import copyleftCommandSetup from './commands/copyleft';
import reportCommandSetup from './commands/report';
import visualizeCommandSetup from './commands/visualize';

const program = new Command();

program.name('license-kit').description('Scan dependencies and check for copyleft licenses.').version(version);

copyleftCommandSetup(program);
reportCommandSetup(program);
visualizeCommandSetup(program);
analyzeCommandSetup(program);

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
