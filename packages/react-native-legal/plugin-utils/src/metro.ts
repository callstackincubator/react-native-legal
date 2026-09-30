import path from 'node:path';

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
 * Returns the root directory of the package that a module file belongs to,
 * or `null` if the module is not inside `node_modules` (e.g. the app's own source file)
 *
 * @example
 * getPackageRoot('/app/node_modules/@scope/pkg/lib/index.js'); // '/app/node_modules/@scope/pkg'
 * getPackageRoot('/app/node_modules/a/node_modules/b/index.js'); // '/app/node_modules/a/node_modules/b'
 * getPackageRoot('/app/src/App.tsx'); // null
 */
export function getPackageRoot(modulePath: string): string | null {
  const marker = `${path.sep}node_modules${path.sep}`;
  const index = modulePath.lastIndexOf(marker);

  if (index === -1) {
    return null;
  }

  const start = index + marker.length;
  const parts = modulePath.slice(start).split(path.sep);
  const nameParts = parts[0].startsWith('@') ? parts.slice(0, 2) : parts.slice(0, 1);

  return modulePath.slice(0, start) + nameParts.join(path.sep);
}

/**
 * Builds the Metro dependency graph of the app for a given platform
 * and returns root directories of all packages included in the production bundle
 *
 * @param projectRoot Root directory of the app (containing `package.json` and `metro.config.js`)
 * @param platform Platform for which the dependency graph should be built
 */
export async function getMetroPackageRoots(projectRoot: string, platform: 'ios' | 'android'): Promise<string[]> {
  const metroPath = require.resolve('metro', { paths: [projectRoot] });
  const { loadConfig, buildGraph }: MetroModule = require(metroPath);

  const config = await loadConfig({ cwd: projectRoot });
  const entryFile = require.resolve(projectRoot);

  const graph = await buildGraph(config, {
    entries: [entryFile],
    platform,
    dev: false,
    minify: false,
  });

  const packageRoots = new Set<string>();

  for (const modulePath of graph.dependencies.keys()) {
    const packageRoot = getPackageRoot(modulePath);

    if (packageRoot) {
      packageRoots.add(packageRoot);
    }
  }

  return [...packageRoots];
}
