import fs from 'fs';
import path from 'path';

import type { ScanPackageOptionsFactory } from '../../types';
import { normalizeRepositoryUrl } from '../../utils/repositoryUtils';

export { prepareAboutLibrariesLicenseField, prepareAboutLibrariesLicenses } from './aboutLibrariesLicenses';
export { buildLicensePlistBody } from './licensePlistBody';
export { readLicenseFiles } from './licenseFiles';

export function getPackageJsonPath(dependency: string, root?: string, projectRoot: string = process.cwd()) {
  const rootsToSearch = [
    ...(root ? [root] : []), // provided for purpose of nested node_modules resolution inside a package dir, in a subdirectory inside the root node_modules dir
    projectRoot, // fallback - root node_modules directory home
  ]; // in order of priority (left-to-right)

  try {
    return require.resolve(`${dependency}/package.json`, { paths: rootsToSearch });
  } catch (error) {
    for (const root of rootsToSearch) {
      const pkgJsonInNodeModules = findPackageJsonInNodeModules(dependency, root);

      if (pkgJsonInNodeModules) {
        return pkgJsonInNodeModules;
      }
    }

    return resolvePackageJsonFromEntry(dependency, rootsToSearch); // final fallback
  }
}

function findPackageJsonInNodeModules(dependency: string, startDir: string) {
  let currentDir = startDir;

  while (currentDir !== path.dirname(currentDir)) {
    if (path.basename(currentDir) !== 'node_modules') {
      const pkgJsonInNodeModules = path.join(currentDir, 'node_modules', dependency, 'package.json');

      if (fs.existsSync(pkgJsonInNodeModules)) return fs.realpathSync(pkgJsonInNodeModules);
    }

    currentDir = path.dirname(currentDir);
  }

  return null;
}

export function resolvePackageJsonFromEntry(dependency: string, paths?: string[]) {
  try {
    const entryPath = require.resolve(dependency, paths ? { paths } : undefined);
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

export function parseAuthorField(json: { author: string | { name: string } }) {
  if (typeof json.author === 'object' && typeof json.author.name === 'string') {
    return json.author.name;
  }

  if (typeof json.author === 'string') {
    return json.author;
  }
}

/**
 * Reads the Raw License from package.json: the `license` string, the legacy `license: { type }` object,
 * or the legacy `licenses: [{ type }, …]` array, whose types are joined with ` OR `.
 */
export function parseLicenseField(json: { license?: string | { type: string }; licenses?: Array<{ type?: string }> }) {
  if (typeof json.license === 'object' && typeof json.license?.type === 'string') {
    return json.license.type;
  }

  if (typeof json.license === 'string') {
    return json.license;
  }

  if (Array.isArray(json.licenses)) {
    const types = json.licenses.flatMap((entry) =>
      typeof entry?.type === 'string' && entry.type.trim() !== '' ? [entry.type] : [],
    );

    return types.length > 0 ? types.join(' OR ') : undefined;
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

/**
 * Default value consistent with legacy behaviour assumptions for the scan package options factory
 * used so as not to introduce breaking API changes
 */
export const legacyDefaultScanPackageOptionsFactory: ScanPackageOptionsFactory = () => ({
  includeTransitiveDependencies: true,
  includeDevDependencies: false,
  includeOptionalDependencies: true,
});
