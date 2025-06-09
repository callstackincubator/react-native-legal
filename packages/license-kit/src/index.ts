import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import { scanDependencies } from '@callstack/react-native-legal-shared';
import minimist from 'minimist';

const args = minimist(process.argv.slice(2));

if (args.help) {
  console.log(`
Usage: license-kit [options]

License Kit: Scan dependencies and check for copyleft licenses.

Options:
  --copyleft: Check for copyleft licenses. Exits with error if strong copyleft licenses are found.
  --error-on-weak: Exit with error if weak copyleft licenses are found.
  --root: Path to the root of the React Native project. Defaults to the current working directory.
  --help: Show this help message.
  `);
  process.exit(0);
}

const repoRootPath = args.root ? path.join(process.cwd(), args.root) : process.cwd();
const packageJsonPath = path.join(repoRootPath, 'package.json');

if (!fs.existsSync(packageJsonPath)) {
  console.error(`package.json not found at ${packageJsonPath}`);
  process.exit(1);
}

const licenses = scanDependencies(packageJsonPath);

if (args.copyleft) {
  const STRONG_COPYLEFT_LICENSES = [
    'GPL',
    'GPL-2.0',
    'GPL-3.0',
    'AGPL-3.0',
    'MPL-2.0',
    'EPL-1.0',
    'EPL-2.0',
    'EUPL-1.1',
    'OSL-3.0',
  ];
  const WEAK_COPYLEFT_LICENSES = ['LGPL', 'LGPL-2.1', 'LGPL-3.0'];
  const strongCopyleftLicenses: string[] = [];
  const weakCopyleftLicenses: string[] = [];

  for (const [key, value] of Object.entries(licenses)) {
    STRONG_COPYLEFT_LICENSES.find((license) => {
      if (value.type === license) {
        strongCopyleftLicenses.push(`- ${key}: ${value.type} (${value.file || value.url})`);
        return true;
      }
    });

    WEAK_COPYLEFT_LICENSES.find((license) => {
      if (value.type === license) {
        weakCopyleftLicenses.push(`- ${key}: ${value.type} (${value.file || value.url})`);
        return true;
      }
    });
  }

  if (strongCopyleftLicenses.length > 0) {
    console.error('❌ Copyleft licenses found in the following dependencies:');
    strongCopyleftLicenses.forEach((entry) => {
      console.error(entry);
    });
    process.exit(1);
  }

  if (weakCopyleftLicenses.length > 0) {
    console.error('⚠️ Weak copyleft licenses found in the following dependencies:');
    weakCopyleftLicenses.forEach((entry) => {
      console.error(entry);
    });
    if (args['error-on-weak']) {
      process.exit(1);
    }
  } else {
    console.log('✅ No copyleft licenses found');
  }
} else {
  console.log(licenses);
}
