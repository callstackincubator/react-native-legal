#!/usr/bin/env node
/* eslint-disable import/no-extraneous-dependencies */
const fs = require('fs');
const path = require('path');
const { parseArgs, styleText } = require('util');

const { globSync } = require('glob');

const options = {
  publicPackages: {
    type: 'string',
    multiple: true,
    short: 'p',
  },
  ignored: {
    type: 'string',
    multiple: true,
    short: 'i',
  },
};

const { values } = parseArgs({ args: process.argv.slice(2), options });

const paths = globSync('**/package.json', {
  cwd: path.resolve(process.cwd()),
  ignore: values.ignored,
});

const errorPaths = [];

for (const packageJsonPath of paths) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, { encoding: 'utf8' }));

  if (!values.publicPackages.includes(packageJson.name) && packageJson.private !== true) {
    errorPaths.push(packageJsonPath);
  }
}

if (errorPaths.length > 0) {
  const listOfErrorPathsStr = errorPaths.reduce((acc, curr) => {
    acc += styleText('red', ` - ${curr}\n`);
    return acc;
  }, '');

  console.error(styleText('redBright', 'There are public workspaces packages that should not be public!!!'));
  console.error(`\n${listOfErrorPathsStr}`);
  process.exit(1);
} else {
  console.log(styleText('green', 'Public packages surface is correct'));
  process.exit(0);
}
