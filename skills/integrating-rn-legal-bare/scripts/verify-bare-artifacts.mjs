#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const rootArgIndex = process.argv.indexOf('--root');
const root = rootArgIndex > -1 ? path.resolve(process.argv[rootArgIndex + 1]) : process.cwd();

const checks = [
  {
    name: 'Android config directory',
    pass: fs.existsSync(path.join(root, 'android', 'config')),
  },
  {
    name: 'iOS Settings.bundle Root.plist',
    pass: fs.existsSync(path.join(root, 'ios', 'Settings.bundle', 'Root.plist')),
  },
  {
    name: 'iOS project has LicensePlist build phase',
    pass: hasLicensePlistBuildPhase(root),
  },
];

const failed = checks.filter((item) => !item.pass);

console.log(
  JSON.stringify(
    {
      root,
      checks,
      ok: failed.length === 0,
    },
    null,
    2,
  ),
);

process.exit(failed.length === 0 ? 0 : 1);

function hasLicensePlistBuildPhase(projectRoot) {
  const iosDir = path.join(projectRoot, 'ios');

  if (!fs.existsSync(iosDir)) {
    return false;
  }

  const pbxprojCandidates = walk(iosDir).filter((filePath) => filePath.endsWith('.pbxproj'));

  for (const filePath of pbxprojCandidates) {
    const content = fs.readFileSync(filePath, 'utf8');

    if (content.includes('Generate licenses with LicensePlist')) {
      return true;
    }
  }

  return false;
}

function walk(dirPath) {
  const out = [];

  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      out.push(...walk(fullPath));
    } else if (entry.isFile()) {
      out.push(fullPath);
    }
  }

  return out;
}
