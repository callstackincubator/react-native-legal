import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { glob } from 'glob';

import type {
  AggregatedLicensesMapping,
  BundleGraphPlatform,
  BundleGraphSource,
  BundledPackages,
  GetBundledPackagesOptions,
} from '../../types';

import { findPackageRoot } from './packageUtils';

const LOG_PREFIX = '[react-native-legal]';
const DEFAULT_PLATFORMS: BundleGraphPlatform[] = ['ios', 'android'];
const DEFAULT_ENTRY_FILE_CANDIDATES = ['index.js', 'index.ts', 'index.tsx', 'index.jsx'];

/**
 * Reads the application's `package.json` (if any) from the project root
 */
function readProjectPackageJson(projectRoot: string): Record<string, any> | undefined {
  const packageJsonPath = path.join(projectRoot, 'package.json');

  if (!fs.existsSync(packageJsonPath)) {
    return undefined;
  }

  try {
    return JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  } catch {
    return undefined;
  }
}

/**
 * Resolves the bundle graph source to be used for a given project
 *
 * @param projectRoot Path to the root of the project
 * @param source Requested source; `'auto'` resolves to `'expo'` if the project depends on `expo`, otherwise to `'metro'`
 */
export function resolveBundleGraphSource(
  projectRoot: string,
  source: BundleGraphSource = 'auto',
): Exclude<BundleGraphSource, 'auto'> {
  if (source !== 'auto') {
    return source;
  }

  const packageJson = readProjectPackageJson(projectRoot);
  const hasExpo = !!(packageJson?.dependencies?.expo || packageJson?.devDependencies?.expo);

  return hasExpo ? 'expo' : 'metro';
}

/**
 * Resolves the entry file of the bundle for the `'metro'` source
 *
 * @param projectRoot Path to the root of the project
 * @param entryFile Optional explicit entry file (relative to `projectRoot` or absolute)
 */
export function resolveMetroEntryFile(projectRoot: string, entryFile?: string): string {
  if (entryFile) {
    const resolvedEntryFile = path.resolve(projectRoot, entryFile);

    if (!fs.existsSync(resolvedEntryFile)) {
      throw new Error(`${LOG_PREFIX} entry file not found: ${resolvedEntryFile}`);
    }

    return resolvedEntryFile;
  }

  const packageJson = readProjectPackageJson(projectRoot);

  if (typeof packageJson?.main === 'string') {
    const mainFile = path.resolve(projectRoot, packageJson.main);

    if (fs.existsSync(mainFile) && fs.statSync(mainFile).isFile()) {
      return mainFile;
    }
  }

  for (const candidate of DEFAULT_ENTRY_FILE_CANDIDATES) {
    const candidatePath = path.join(projectRoot, candidate);

    if (fs.existsSync(candidatePath)) {
      return candidatePath;
    }
  }

  throw new Error(
    `${LOG_PREFIX} could not detect the bundle entry file in ${projectRoot}; pass the 'entryFile' option explicitly`,
  );
}

/**
 * Resolves the path to the executable script of a package's `bin` entry, installed in the project
 */
function resolveBinScript(packageName: string, binName: string, projectRoot: string): string {
  let packageJsonPath: string;

  try {
    packageJsonPath = require.resolve(`${packageName}/package.json`, { paths: [projectRoot] });
  } catch {
    throw new Error(
      `${LOG_PREFIX} could not find '${packageName}' installed in ${projectRoot}; it is required to read the bundle dependency graph`,
    );
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  const bin = typeof packageJson.bin === 'string' ? packageJson.bin : packageJson.bin?.[binName];

  if (typeof bin !== 'string') {
    throw new Error(`${LOG_PREFIX} '${packageName}' does not expose the '${binName}' executable`);
  }

  return path.join(path.dirname(packageJsonPath), bin);
}

function runNodeScript(script: string, args: string[], cwd: string, label: string): string {
  const result = spawnSync(process.execPath, [script, ...args], {
    cwd,
    encoding: 'utf-8',
    maxBuffer: 1024 * 1024 * 512,
    env: { ...process.env, CI: process.env.CI ?? '1' },
  });

  if (result.error) {
    throw new Error(`${LOG_PREFIX} failed to run ${label}: ${result.error.message}`);
  }

  if (result.status !== 0) {
    throw new Error(
      `${LOG_PREFIX} ${label} exited with code ${result.status}${result.stderr ? `:\n${result.stderr}` : ''}`,
    );
  }

  return result.stdout ?? '';
}

/**
 * Runs `metro get-dependencies` and returns the absolute paths of all modules in the resulting dependency graph
 *
 * @param options Options; `platforms` defaults to `['ios', 'android']`
 */
export function getMetroModulePaths(options: GetBundledPackagesOptions): string[] {
  const projectRoot = path.resolve(options.projectRoot);
  const platforms = options.platforms?.length ? options.platforms : DEFAULT_PLATFORMS;
  const entryFile = resolveMetroEntryFile(projectRoot, options.entryFile);
  const metroScript = resolveBinScript('metro', 'metro', projectRoot);
  const modulePaths = new Set<string>();

  for (const platform of platforms) {
    const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'react-native-legal-metro-'));
    const outputFile = path.join(outputDir, `${platform}.txt`);

    try {
      // note: `metro get-dependencies` never uses the Metro cache, so `resetCache` is a no-op for this source
      const args = [
        'get-dependencies',
        '--entry-file',
        entryFile,
        '--platform',
        platform,
        options.dev ? '--dev' : '--no-dev',
        '--output',
        outputFile,
      ];

      runNodeScript(metroScript, args, projectRoot, `metro get-dependencies (${platform})`);

      const output = fs.existsSync(outputFile) ? fs.readFileSync(outputFile, 'utf-8') : '';

      for (const line of output.split(/\r?\n/)) {
        const modulePath = line.trim();

        if (modulePath) {
          modulePaths.add(path.resolve(projectRoot, modulePath));
        }
      }
    } finally {
      fs.rmSync(outputDir, { recursive: true, force: true });
    }
  }

  return [...modulePaths];
}

/**
 * Lists the project root and all its ancestor directories, in order of proximity
 */
function getCandidateRoots(projectRoot: string): string[] {
  const roots: string[] = [];

  let currentDir = path.resolve(projectRoot);

  do {
    roots.push(currentDir);
    currentDir = path.dirname(currentDir);
  } while (currentDir !== roots[roots.length - 1]);

  return roots;
}

/**
 * Locates a source map `sources` entry on disk
 *
 * Metro emits sources relative to the Metro server root (which, in monorepos, is the workspace root rather than the project root),
 * prefixed with a `/` - so the entry is looked up relative to the project root and, subsequently, its ancestors.
 * Virtual modules (e.g. `expo/virtual/...`) that do not exist on disk are attributed to the closest package that does exist.
 */
function locateSourceMapSource(source: string, candidateRoots: string[]): string | undefined {
  if (path.isAbsolute(source) && fs.existsSync(source)) {
    return source;
  }

  const relativeSource = source.replace(/^[/\\]+/, '');
  const candidates = candidateRoots.map((root) => path.resolve(root, relativeSource));

  const existingCandidate = candidates.find((candidate) => fs.existsSync(candidate));

  if (existingCandidate) {
    return existingCandidate;
  }

  return candidates.find((candidate) => {
    const packageRoot = findPackageRoot(candidate);

    return packageRoot !== undefined && !candidateRoots.includes(packageRoot);
  });
}

/**
 * Extracts absolute module paths from the `sources` field of source maps found in a directory
 *
 * @param sourceMapsDir Directory to search (recursively) for `*.map` files
 * @param projectRoot Path to the root of the project, used to resolve relative sources (together with its ancestor directories, see Metro server root)
 */
export function getModulePathsFromSourceMaps(sourceMapsDir: string, projectRoot: string): string[] {
  const sourceMapFiles = glob.sync('**/*.map', { cwd: sourceMapsDir, absolute: true, nodir: true });
  const candidateRoots = getCandidateRoots(projectRoot);
  const modulePaths = new Set<string>();

  for (const sourceMapFile of sourceMapFiles) {
    let sourceMap: { sources?: unknown; sourceRoot?: unknown };

    try {
      sourceMap = JSON.parse(fs.readFileSync(sourceMapFile, 'utf-8'));
    } catch {
      console.warn(`${LOG_PREFIX} could not parse source map ${sourceMapFile}`);
      continue;
    }

    if (!Array.isArray(sourceMap.sources)) {
      continue;
    }

    const sourceRoot = typeof sourceMap.sourceRoot === 'string' ? sourceMap.sourceRoot : '';

    for (const source of sourceMap.sources) {
      if (typeof source !== 'string' || !source) {
        continue;
      }

      // skip virtual modules emitted by Metro / Expo (e.g. `__prelude__`, `<anonymous>`, `\0polyfill:...`)
      if (source.startsWith('__') || source.startsWith('<') || source.startsWith('\0')) {
        continue;
      }

      const modulePath = locateSourceMapSource(sourceRoot ? path.join(sourceRoot, source) : source, candidateRoots);

      if (modulePath) {
        modulePaths.add(modulePath);
      }
    }
  }

  return [...modulePaths];
}

/**
 * Runs `expo export` with source maps and returns the absolute paths of all modules in the resulting bundles
 *
 * @param options Options; `platforms` defaults to `['ios', 'android']`
 */
export function getExpoExportModulePaths(options: GetBundledPackagesOptions): string[] {
  const projectRoot = path.resolve(options.projectRoot);
  const platforms = options.platforms?.length ? options.platforms : DEFAULT_PLATFORMS;
  const expoScript = resolveBinScript('expo', 'expo', projectRoot);
  const modulePaths = new Set<string>();

  for (const platform of platforms) {
    const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'react-native-legal-expo-'));

    try {
      const args = [
        'export',
        '--platform',
        platform,
        '--output-dir',
        outputDir,
        '--source-maps',
        'true',
        '--no-minify',
        '--no-bytecode',
      ];

      if (options.dev) {
        args.push('--dev');
      }

      if (options.resetCache) {
        args.push('--clear');
      }

      runNodeScript(expoScript, args, projectRoot, `expo export (${platform})`);

      for (const modulePath of getModulePathsFromSourceMaps(outputDir, projectRoot)) {
        modulePaths.add(modulePath);
      }
    } finally {
      fs.rmSync(outputDir, { recursive: true, force: true });
    }
  }

  return [...modulePaths];
}

/**
 * Maps module paths to the packages they belong to, based on the closest `package.json` up the directory tree
 *
 * @param modulePaths Absolute paths of modules in the bundle dependency graph
 * @returns Set of package keys (`<name>@<version>`) & names of the packages owning the modules; modules that do not belong to a named package are ignored
 */
export function getBundledPackagesFromModulePaths(modulePaths: string[]): BundledPackages {
  const packageKeys = new Set<string>();
  const packageNames = new Set<string>();
  const packageRootCache = new Map<string, { name?: string; version?: string } | null>();

  for (const modulePath of modulePaths) {
    const packageRoot = findPackageRoot(modulePath);

    if (!packageRoot) {
      continue;
    }

    let packageInfo = packageRootCache.get(packageRoot);

    if (packageInfo === undefined) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf-8'));

        packageInfo = { name: packageJson.name, version: packageJson.version };
      } catch {
        packageInfo = null;
      }

      packageRootCache.set(packageRoot, packageInfo);
    }

    if (!packageInfo || typeof packageInfo.name !== 'string') {
      continue;
    }

    packageNames.add(packageInfo.name);

    if (typeof packageInfo.version === 'string') {
      packageKeys.add(`${packageInfo.name}@${packageInfo.version}`);
    }
  }

  return { packageKeys, packageNames, modulePaths: [...modulePaths] };
}

/**
 * Determines which packages are actually bundled by Metro, by reading the bundle dependency graph
 *
 * Depending on the resolved source, this runs either `metro get-dependencies` or `expo export --source-maps`
 * in the project root, so the project's Metro configuration is respected.
 *
 * @param options Options controlling how the dependency graph is obtained
 * @returns Set of package keys (`<name>@<version>`) & names of the bundled packages; keys match the keys of {@link AggregatedLicensesMapping}
 * @see {@link filterLicensesByBundledPackages}
 */
export function getBundledPackages(options: GetBundledPackagesOptions): BundledPackages {
  const projectRoot = path.resolve(options.projectRoot);
  const source = resolveBundleGraphSource(projectRoot, options.source);
  const modulePaths =
    source === 'expo'
      ? getExpoExportModulePaths({ ...options, projectRoot })
      : getMetroModulePaths({ ...options, projectRoot });

  return getBundledPackagesFromModulePaths(modulePaths);
}

/**
 * Filters scanned licenses, leaving only the packages that are present in the bundle dependency graph
 *
 * A license entry is kept if its `<name>@<version>` key is one of the bundled package keys, or - as a fallback for packages
 * without a `version` field - if its name is one of the bundled package names.
 *
 * @param licenses Scanned licenses, as returned by `scanDependencies`
 * @param bundledPackages Bundled packages, as returned by {@link getBundledPackages}
 * @returns New aggregated licenses object containing only the bundled packages
 */
export function filterLicensesByBundledPackages(
  licenses: AggregatedLicensesMapping,
  bundledPackages: Pick<BundledPackages, 'packageKeys' | 'packageNames'>,
): AggregatedLicensesMapping {
  const result: AggregatedLicensesMapping = {};

  for (const [packageKey, license] of Object.entries(licenses)) {
    const isBundled =
      bundledPackages.packageKeys.has(packageKey) ||
      (!license.version && bundledPackages.packageNames.has(license.name));

    if (isBundled) {
      result[packageKey] = license;
    }
  }

  return result;
}
