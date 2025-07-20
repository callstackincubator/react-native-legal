#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');

const { scanDependencies } = require('@callstack/licenses');

const repoRootPath = path.resolve(process.cwd());
const packageJsonPath = path.join(repoRootPath, 'package.json');

if (!fs.existsSync(packageJsonPath)) {
  console.error(`package.json not found at ${packageJsonPath}`);
  process.exit(1);
}

const licenses = scanDependencies(packageJsonPath);

const payload = Object.entries(licenses)
  .map(([packageKey, licenseObj]) => {
    return {
      name: licenseObj.name,
      version: licenseObj.version,
      content: licenseObj.content ?? licenseObj.type ?? 'UNKNOWN',
      packageKey,
      ...(licenseObj.url && { source: licenseObj.url }),
    };
  })
  .toSorted((first, second) => {
    if (!first.version || !second.version) {
      return first.name > second.name;
    }

    if (first.name !== second.name) {
      return first.name > second.name ? 1 : -1;
    }

    const [firstMajor, firstMinor, firstPatch] = first.version.split('.').filter(Boolean);
    const [secondMajor, secondMinor, secondPatch] = second.version.split('.').filter(Boolean);

    return `${first.name}.${firstMajor.padStart(10, '0')}.${(firstMinor ?? '0').padStart(10, '0')}.${(
      firstPatch ?? '0'
    ).padStart(10, '0')}` >
      `${second.name}.${secondMajor.padStart(10, '0')}.${(secondMinor ?? '0').padStart(10, '0')}.${(
        secondPatch ?? '0'
      ).padStart(10, '0')}`
      ? 1
      : -1;
  });

const rnLegalConfigPath = path.join(__dirname, '..', '.rnlegal');

if (!fs.existsSync(rnLegalConfigPath)) {
  fs.mkdirSync(rnLegalConfigPath);
}

const rnLegalConfigLibrariesPath = path.join(rnLegalConfigPath, 'libraries.json');

fs.writeFileSync(rnLegalConfigLibrariesPath, JSON.stringify(payload), { encoding: 'utf-8' });

console.log(`✅ Output written to ${rnLegalConfigLibrariesPath}`);
