import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import { scanDependencies } from '@callstack/react-native-legal-shared';
import signale from 'signale';

// import Command from 'commander';
const repoRootPath = process.cwd();

const packageJsonPath = path.join(repoRootPath, 'package.json');

if (!fs.existsSync(packageJsonPath)) {
  signale.error(`package.json not found at ${packageJsonPath}`);
  process.exit(1);
}

scanDependencies(packageJsonPath);
