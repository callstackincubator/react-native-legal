import fs from 'fs';
import path from 'path';

import type { LicenseObj } from '../types';

import { sha512 } from './miscUtils';
import { normalizeRepositoryUrl } from './repositoryUtils';

export function getPackageJsonPath(dependency: string, root = process.cwd()) {
  try {
    return require.resolve(`${dependency}/package.json`, { paths: [root] });
  } catch (error) {
    const pkgJsonInNodeModules = path.join(root, 'node_modules', dependency, 'package.json');

    return fs.existsSync(pkgJsonInNodeModules) ? pkgJsonInNodeModules : resolvePackageJsonFromEntry(dependency);
  }
}

export function resolvePackageJsonFromEntry(dependency: string) {
  try {
    const entryPath = require.resolve(dependency);
    const packageDir = findPackageRoot(entryPath);

    if (!packageDir) return null;

    const packageJsonPath = path.join(packageDir, 'package.json');

    return fs.existsSync(packageJsonPath) ? packageJsonPath : null;
  } catch {
    return null;
  }
}

export function findPackageRoot(entryPath: string) {
  let currentDir = path.dirname(entryPath);
  while (currentDir !== path.dirname(currentDir)) {
    if (fs.existsSync(path.join(currentDir, 'package.json'))) return currentDir;
    currentDir = path.dirname(currentDir);
  }
}

export function normalizePackageName(packageName: string): string {
  return packageName.replace('/', '_');
}

export function prepareAboutLibrariesLicenseField(license: LicenseObj) {
  if (!license.type) {
    return '';
  }

  return `${license.type}_${sha512(license.content ?? license.type)}`;
}

export function parseAuthorField(json: { author: string | { name: string } }) {
  if (typeof json.author === 'object' && typeof json.author.name === 'string') {
    return json.author.name;
  }

  if (typeof json.author === 'string') {
    return json.author;
  }
}

export function parseLicenseField(json: { license: string | { type: string } }) {
  if (typeof json.license === 'object' && typeof json.license.type === 'string') {
    return json.license.type;
  }

  if (typeof json.license === 'string') {
    return json.license;
  }
}

export function parseRepositoryFieldToUrl(json: { repository: string | { url?: string } }) {
  if (typeof json.repository === 'object' && typeof json.repository.url === 'string') {
    return normalizeRepositoryUrl(json.repository.url);
  }

  if (typeof json.repository === 'string') {
    return normalizeRepositoryUrl(json.repository);
  }
}
