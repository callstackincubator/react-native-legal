import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { scanDependencies } from '../common';

function writePackage(dir: string, packageJson: Record<string, unknown>) {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify(packageJson));
}

/**
 * Writes a package whose `exports` map does not expose `./package.json`, so `require.resolve('<name>/package.json')` fails
 */
function writePackageWithHiddenPackageJson(dir: string, packageJson: Record<string, unknown>) {
  writePackage(dir, { ...packageJson, main: './index.js', exports: { '.': './index.js' } });
  fs.writeFileSync(path.join(dir, 'index.js'), 'module.exports = {};');
}

/**
 * Monorepo with an app whose own `node_modules` has a different `fixture-shared` than the hoisted one,
 * plus an unrelated directory (`elsewhere`) with yet other versions, to stand in for a wrong `process.cwd()`
 */
function createMonorepo(root: string) {
  const appDir = path.join(root, 'apps', 'app');

  writePackage(path.join(root, 'node_modules', 'fixture-shared'), { name: 'fixture-shared', version: '2.0.0' });
  writePackage(path.join(root, 'node_modules', 'fixture-hoisted'), { name: 'fixture-hoisted', version: '1.0.0' });
  writePackage(appDir, {
    name: 'fixture-app',
    private: true,
    dependencies: { 'fixture-shared': '^1.0.0', 'fixture-hoisted': '1.0.0' },
  });
  writePackage(path.join(appDir, 'node_modules', 'fixture-shared'), { name: 'fixture-shared', version: '1.0.0' });
  writePackage(path.join(root, 'elsewhere', 'node_modules', 'fixture-shared'), {
    name: 'fixture-shared',
    version: '9.9.9',
  });
  writePackage(path.join(root, 'elsewhere', 'node_modules', 'fixture-hoisted'), {
    name: 'fixture-hoisted',
    version: '9.9.9',
  });

  return appDir;
}

/**
 * Monorepo with an app, a library workspace the app does not depend on,
 * and a backend folder inside the app with its own `node_modules` (e.g. a separately bundled JS VM)
 */
function createMonorepoWithAdditionalProjects(root: string) {
  const appDir = path.join(root, 'apps', 'app');
  const backendDir = path.join(appDir, 'backend');

  writePackage(path.join(root, 'node_modules', 'fixture-hoisted'), { name: 'fixture-hoisted', version: '1.0.0' });
  writePackage(path.join(root, 'node_modules', 'fixture-common'), { name: 'fixture-common', version: '1.0.0' });
  writePackage(path.join(root, 'node_modules', 'fixture-lib-dep'), {
    name: 'fixture-lib-dep',
    version: '1.0.0',
    dependencies: { 'fixture-common': '1.0.0' },
  });
  writePackage(appDir, {
    name: 'fixture-app',
    private: true,
    dependencies: { 'fixture-app-dep': '1.0.0', 'fixture-shared': '*' },
  });
  writePackage(path.join(appDir, 'node_modules', 'fixture-app-dep'), {
    name: 'fixture-app-dep',
    version: '1.0.0',
    dependencies: { 'fixture-common': '^1.0.0' },
  });
  writePackage(path.join(appDir, 'node_modules', 'fixture-shared'), { name: 'fixture-shared', version: '1.0.0' });
  writePackage(backendDir, {
    name: 'fixture-backend',
    private: true,
    dependencies: { 'fixture-shared': '*' },
    devDependencies: { 'fixture-backend-tool': '1.0.0' },
  });
  writePackage(path.join(backendDir, 'node_modules', 'fixture-shared'), { name: 'fixture-shared', version: '2.0.0' });
  writePackage(path.join(backendDir, 'node_modules', 'fixture-backend-tool'), {
    name: 'fixture-backend-tool',
    version: '1.0.0',
  });
  writePackage(path.join(root, 'packages', 'lib'), {
    name: '@fixture/lib',
    version: '0.1.0',
    license: 'MIT',
    dependencies: { 'fixture-hoisted': '1.0.0', 'fixture-lib-dep': '1.0.0' },
  });
  fs.mkdirSync(path.join(root, 'not-a-project'));

  return appDir;
}

describe('scanDependencies', () => {
  let tmp: string;

  beforeEach(() => {
    tmp = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'rnl-scan-dependencies-')));
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  describe('dependency resolution', () => {
    it.each(['apps/app', '.', 'elsewhere'])(
      'lists the versions installed for the scanned project when process.cwd() is %s',
      (cwd) => {
        const appDir = createMonorepo(tmp);

        jest.spyOn(process, 'cwd').mockReturnValue(path.join(tmp, cwd));

        const licenses = scanDependencies(path.join(appDir, 'package.json'));

        expect(Object.keys(licenses).sort()).toEqual(['fixture-hoisted@1.0.0', 'fixture-shared@1.0.0']);
      },
    );

    it.each(['apps/app', '.', 'elsewhere'])(
      'finds a hoisted dependency whose package.json is not exported when process.cwd() is %s',
      (cwd) => {
        const appDir = path.join(tmp, 'apps', 'app');

        writePackageWithHiddenPackageJson(path.join(tmp, 'node_modules', 'fixture-hidden'), {
          name: 'fixture-hidden',
          version: '3.0.0',
        });
        writePackage(appDir, { name: 'fixture-app', private: true, dependencies: { 'fixture-hidden': '3.0.0' } });
        jest.spyOn(process, 'cwd').mockReturnValue(path.join(tmp, cwd));

        const licenses = scanDependencies(path.join(appDir, 'package.json'));

        expect(Object.keys(licenses)).toEqual(['fixture-hidden@3.0.0']);
      },
    );

    it('resolves dependencies of a symlinked package next to its real location (pnpm layout)', () => {
      const appDir = path.join(tmp, 'apps', 'app');
      const store = path.join(tmp, 'node_modules', '.pnpm');
      const parentRealDir = path.join(store, 'fixture-parent@1.0.0', 'node_modules', 'fixture-parent');
      const childRealDir = path.join(store, 'fixture-child@1.0.0', 'node_modules', 'fixture-child');

      writePackageWithHiddenPackageJson(parentRealDir, {
        name: 'fixture-parent',
        version: '1.0.0',
        dependencies: { 'fixture-child': '1.0.0' },
      });
      writePackageWithHiddenPackageJson(childRealDir, { name: 'fixture-child', version: '1.0.0' });
      fs.symlinkSync(childRealDir, path.join(store, 'fixture-parent@1.0.0', 'node_modules', 'fixture-child'), 'dir');
      writePackage(appDir, { name: 'fixture-app', private: true, dependencies: { 'fixture-parent': '1.0.0' } });
      fs.mkdirSync(path.join(appDir, 'node_modules'));
      fs.symlinkSync(parentRealDir, path.join(appDir, 'node_modules', 'fixture-parent'), 'dir');

      const licenses = scanDependencies(path.join(appDir, 'package.json'));

      expect(Object.keys(licenses).sort()).toEqual(['fixture-child@1.0.0', 'fixture-parent@1.0.0']);
    });

    it('resolves dependencies of a project reached through a symlinked directory', () => {
      const appDir = path.join(tmp, 'repo', 'apps', 'app');
      const linkToAppDir = path.join(tmp, 'link-to-app');

      writePackageWithHiddenPackageJson(path.join(tmp, 'repo', 'node_modules', 'fixture-hidden'), {
        name: 'fixture-hidden',
        version: '3.0.0',
      });
      writePackage(appDir, { name: 'fixture-app', private: true, dependencies: { 'fixture-hidden': '3.0.0' } });
      fs.symlinkSync(appDir, linkToAppDir, 'dir');

      const licenses = scanDependencies(path.join(linkToAppDir, 'package.json'));

      expect(Object.keys(licenses)).toEqual(['fixture-hidden@3.0.0']);
    });

    it('does not list packages that only @callstack/licenses itself can resolve', () => {
      const appDir = path.join(tmp, 'app');

      // `glob` is a dependency of @callstack/licenses, but it is not installed for the scanned project
      writePackage(appDir, { name: 'fixture-app', private: true, dependencies: { glob: '^13.0.0' } });

      const licenses = scanDependencies(path.join(appDir, 'package.json'));

      expect(Object.keys(licenses)).toEqual([]);
    });

    it('does not take a transitive dependency missing from the scanned project from process.cwd()', () => {
      const appDir = path.join(tmp, 'app');
      const cwd = path.join(tmp, 'elsewhere');

      writePackage(appDir, { name: 'fixture-app', private: true, dependencies: { 'fixture-parent': '1.0.0' } });
      writePackage(path.join(appDir, 'node_modules', 'fixture-parent'), {
        name: 'fixture-parent',
        version: '1.0.0',
        dependencies: { 'fixture-missing': '1.0.0' },
      });
      writePackage(path.join(cwd, 'node_modules', 'fixture-missing'), { name: 'fixture-missing', version: '9.9.9' });
      jest.spyOn(process, 'cwd').mockReturnValue(cwd);

      const licenses = scanDependencies(path.join(appDir, 'package.json'));

      expect(Object.keys(licenses)).toEqual(['fixture-parent@1.0.0']);
    });
  });

  describe('additionalProjectRoots', () => {
    it.each([
      ['a relative', () => '../../packages/lib'],
      ['an absolute', () => path.join(tmp, 'packages', 'lib')],
    ])('lists dependencies of an additional project root given as %s path next to the app ones', (_, getRoot) => {
      const appDir = createMonorepoWithAdditionalProjects(tmp);

      const licenses = scanDependencies(path.join(appDir, 'package.json'), undefined, {
        additionalProjectRoots: [getRoot()],
      });

      expect(Object.keys(licenses).sort()).toEqual([
        'fixture-app-dep@1.0.0',
        'fixture-common@1.0.0',
        'fixture-hoisted@1.0.0',
        'fixture-lib-dep@1.0.0',
        'fixture-shared@1.0.0',
      ]);
    });

    it('resolves a relative additional project root from the real directory of an app reached through a symlink', () => {
      const appDir = createMonorepoWithAdditionalProjects(path.join(tmp, 'repo'));
      const linkToAppDir = path.join(tmp, 'links', 'app');

      fs.mkdirSync(path.dirname(linkToAppDir));
      fs.symlinkSync(appDir, linkToAppDir, 'dir');

      const licenses = scanDependencies(path.join(linkToAppDir, 'package.json'), undefined, {
        additionalProjectRoots: ['../../packages/lib'],
      });

      expect(Object.keys(licenses).sort()).toEqual([
        'fixture-app-dep@1.0.0',
        'fixture-common@1.0.0',
        'fixture-hoisted@1.0.0',
        'fixture-lib-dep@1.0.0',
        'fixture-shared@1.0.0',
      ]);
    });

    it("resolves an additional project root's dependencies from its own node_modules, even for a range the app already requires", () => {
      const appDir = createMonorepoWithAdditionalProjects(tmp);

      const licenses = scanDependencies(path.join(appDir, 'package.json'), undefined, {
        additionalProjectRoots: ['backend'],
      });

      expect(Object.keys(licenses).sort()).toEqual([
        'fixture-app-dep@1.0.0',
        'fixture-common@1.0.0',
        'fixture-shared@1.0.0',
        'fixture-shared@2.0.0',
      ]);
    });

    it('lists devDependencies of an additional project root when the root scan options include them', () => {
      const appDir = createMonorepoWithAdditionalProjects(tmp);

      const licenses = scanDependencies(
        path.join(appDir, 'package.json'),
        ({ isRoot }) => ({
          includeDevDependencies: isRoot,
          includeTransitiveDependencies: true,
          includeOptionalDependencies: true,
        }),
        { additionalProjectRoots: ['backend'] },
      );

      expect(Object.keys(licenses)).toContain('fixture-backend-tool@1.0.0');
    });

    it('does not list devDependencies of an additional project root with the default scan options', () => {
      const appDir = createMonorepoWithAdditionalProjects(tmp);

      const licenses = scanDependencies(path.join(appDir, 'package.json'), undefined, {
        additionalProjectRoots: ['backend'],
      });

      expect(Object.keys(licenses)).not.toContain('fixture-backend-tool@1.0.0');
    });

    it('combines parent packages of a package version found in several project roots', () => {
      const appDir = createMonorepoWithAdditionalProjects(tmp);

      const licenses = scanDependencies(path.join(appDir, 'package.json'), undefined, {
        additionalProjectRoots: ['../../packages/lib'],
      });

      expect(licenses['fixture-common@1.0.0'].parentPackages).toEqual([
        { name: 'fixture-app-dep', requiredVersion: '1.0.0', resolvedVersion: '1.0.0' },
        { name: 'fixture-lib-dep', requiredVersion: '1.0.0', resolvedVersion: '1.0.0' },
      ]);
    });

    it.each(['../../missing', '../../not-a-project'])(
      'throws a descriptive error for an additional project root that is not a directory with a package.json (%s)',
      (additionalProjectRoot) => {
        const appDir = createMonorepoWithAdditionalProjects(tmp);

        expect(() =>
          scanDependencies(path.join(appDir, 'package.json'), undefined, {
            additionalProjectRoots: [additionalProjectRoot],
          }),
        ).toThrow(/additional project root/i);
      },
    );

    it.each([
      ['a string', '../../packages/lib'],
      ['a non-string entry', [42]],
      ['an empty path', ['']],
    ])('rejects additionalProjectRoots that is not an array of non-empty paths (%s)', (_, additionalProjectRoots) => {
      const appDir = createMonorepoWithAdditionalProjects(tmp);

      expect(() =>
        scanDependencies(path.join(appDir, 'package.json'), undefined, {
          additionalProjectRoots: additionalProjectRoots as string[],
        }),
      ).toThrow(/\[react-native-legal\] additionalProjectRoots/);
    });
  });
});
