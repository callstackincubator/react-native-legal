import fs from 'node:fs';
import path from 'node:path';

import { findPackageRoot } from '@callstack/licenses';

/**
 * Minimal typing of the Metro APIs used below - Metro is not a dependency of this package,
 * it is loaded from the app's project
 */
type MetroModule = {
  loadConfig: (argv: { cwd: string }) => Promise<unknown>;
  buildGraph: (
    config: unknown,
    options: { entries: string[]; platform: string; dev: boolean; minify: boolean },
  ) => Promise<{ dependencies: ReadonlyMap<string, unknown> }>;
};

/**
 * Resolves the entry file of the app, the same way it is resolved when bundling:
 * `main` field of the app's `package.json` (either a relative path, e.g. `index.js`, or a module, e.g. `expo-router/entry`),
 * falling back to `index` file in the project root
 *
 * @param projectRoot Root directory of the app (containing `package.json`)
 */
export function resolveEntryFile(projectRoot: string): string {
  const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), { encoding: 'utf-8' }));
  const main: string | undefined = packageJson.main;

  if (!main) {
    return require.resolve(path.join(projectRoot, 'index'));
  }

  try {
    return require.resolve(path.resolve(projectRoot, main));
  } catch {
    return require.resolve(main, { paths: [projectRoot] });
  }
}

/**
 * Builds the Metro dependency graph of the app for a given platform
 * and returns root directories of all packages included in the production bundle
 * (the app's own package is not included)
 *
 * @param projectRoot Root directory of the app (containing `package.json` and `metro.config.js`)
 * @param platform Platform for which the dependency graph should be built
 */
export async function getMetroPackageRoots(projectRoot: string, platform: 'ios' | 'android'): Promise<string[]> {
  const metroPath = require.resolve('metro', { paths: [projectRoot] });
  const { loadConfig, buildGraph }: MetroModule = require(metroPath);

  const config = await loadConfig({ cwd: projectRoot });

  const graph = await buildGraph(config, {
    entries: [resolveEntryFile(projectRoot)],
    platform,
    dev: false,
    minify: false,
  });

  // Metro reports real paths of the modules, so the project root has to be compared by its real path too
  const appRoot = fs.realpathSync(projectRoot);
  // many modules share a directory - look up the package root only once per directory
  const moduleDirs = new Set([...graph.dependencies.keys()].map((modulePath) => path.dirname(modulePath)));
  const packageRoots = new Set<string>();

  for (const moduleDir of moduleDirs) {
    const packageRoot = findPackageRoot(moduleDir);

    if (packageRoot && packageRoot !== appRoot) {
      packageRoots.add(packageRoot);
    }
  }

  return [...packageRoots];
}
