import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import type { CLIVisualizeOptions } from '../types/CLIOptions';

export function getProjectPaths(options: { root: string }) {
  const repoRootPath = path.resolve(options.root);
  const packageJsonPath = path.join(repoRootPath, 'package.json');

  if (!fs.existsSync(packageJsonPath)) {
    console.error(`package.json not found at ${packageJsonPath}`);
    process.exit(1);
  }

  return { packageJsonPath, repoRootPath };
}

export function getPackageLockChecksum(options: CLIVisualizeOptions) {
  return createHash('sha256')
    .update(fs.readFileSync(getLockfilePath(options), 'utf8'))
    .digest('hex');
}

export function getLockfilePath(options: CLIVisualizeOptions) {
  const { repoRootPath } = getProjectPaths(options);

  let pthBase = repoRootPath;

  while (pthBase !== path.dirname(pthBase)) {
    let pth = path.join(pthBase, 'package-lock.json');
    if (fs.existsSync(pth)) {
      return pth;
    }

    pth = path.join(pthBase, 'pnpm-lock.yaml');
    if (fs.existsSync(pth)) {
      return pth;
    }

    pth = path.join(pthBase, 'yarn.lock');
    if (fs.existsSync(pth)) {
      return pth;
    }

    pth = path.join(pthBase, 'bun.lock');
    if (fs.existsSync(pth)) {
      return pth;
    }

    pth = path.join(pthBase, 'bun.lockb');
    if (fs.existsSync(pth)) {
      return pth;
    }

    pthBase = path.dirname(pthBase);
  }

  throw new Error('No lockfile found');
}
