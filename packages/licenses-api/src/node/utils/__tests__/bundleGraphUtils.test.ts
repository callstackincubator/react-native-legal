import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import type { AggregatedLicensesMapping, License } from '../../../types';
import {
  filterLicensesByBundledPackages,
  getBundledPackages,
  getBundledPackagesFromModulePaths,
  getModulePathsFromSourceMaps,
  resolveBundleGraphSource,
  resolveMetroEntryFile,
} from '../bundleGraphUtils';

jest.mock('node:child_process', () => ({
  spawnSync: jest.fn(),
}));

const spawnSyncMock = spawnSync as jest.MockedFunction<typeof spawnSync>;

function writeJson(filePath: string, content: unknown) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(content));
}

function touch(filePath: string, content = '') {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
}

const makeLicense = (overrides: Partial<License>): License =>
  ({
    name: 'pkg',
    version: '1.0.0',
    dependencyType: 'dependency',
    requiredVersion: '1.0.0',
    parentPackages: [],
    ...overrides,
  }) as License;

describe('bundleGraphUtils', () => {
  let projectRoot: string;

  beforeEach(() => {
    projectRoot = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'rnl-bundle-graph-')));
    spawnSyncMock.mockReset();
  });

  afterEach(() => {
    fs.rmSync(projectRoot, { recursive: true, force: true });
  });

  describe('resolveBundleGraphSource', () => {
    it('should return the explicit source as-is', () => {
      expect(resolveBundleGraphSource(projectRoot, 'metro')).toBe('metro');
      expect(resolveBundleGraphSource(projectRoot, 'expo')).toBe('expo');
    });

    it("should resolve 'auto' to 'expo' when the project depends on expo", () => {
      writeJson(path.join(projectRoot, 'package.json'), { name: 'app', dependencies: { expo: '^56.0.0' } });

      expect(resolveBundleGraphSource(projectRoot, 'auto')).toBe('expo');
    });

    it("should resolve 'auto' to 'metro' when the project does not depend on expo", () => {
      writeJson(path.join(projectRoot, 'package.json'), { name: 'app', dependencies: { 'react-native': '0.85.0' } });

      expect(resolveBundleGraphSource(projectRoot)).toBe('metro');
    });
  });

  describe('resolveMetroEntryFile', () => {
    it('should use the explicit entry file relative to the project root', () => {
      touch(path.join(projectRoot, 'src/main.ts'));

      expect(resolveMetroEntryFile(projectRoot, 'src/main.ts')).toBe(path.join(projectRoot, 'src/main.ts'));
    });

    it('should throw when the explicit entry file does not exist', () => {
      expect(() => resolveMetroEntryFile(projectRoot, 'missing.js')).toThrow('entry file not found');
    });

    it('should use the main field of package.json when it points to an existing file', () => {
      writeJson(path.join(projectRoot, 'package.json'), { name: 'app', main: 'App.tsx' });
      touch(path.join(projectRoot, 'App.tsx'));
      touch(path.join(projectRoot, 'index.js'));

      expect(resolveMetroEntryFile(projectRoot)).toBe(path.join(projectRoot, 'App.tsx'));
    });

    it('should fall back to index.* candidates', () => {
      writeJson(path.join(projectRoot, 'package.json'), { name: 'app', main: 'expo-router/entry' });
      touch(path.join(projectRoot, 'index.tsx'));

      expect(resolveMetroEntryFile(projectRoot)).toBe(path.join(projectRoot, 'index.tsx'));
    });

    it('should throw when no entry file can be detected', () => {
      expect(() => resolveMetroEntryFile(projectRoot)).toThrow('could not detect the bundle entry file');
    });
  });

  describe('getBundledPackagesFromModulePaths', () => {
    it('should map module paths to owning packages, including nested node_modules', () => {
      writeJson(path.join(projectRoot, 'package.json'), { name: 'app', version: '0.0.1' });
      writeJson(path.join(projectRoot, 'node_modules/react/package.json'), { name: 'react', version: '19.0.0' });
      writeJson(path.join(projectRoot, 'node_modules/@scope/lib/package.json'), {
        name: '@scope/lib',
        version: '2.1.0',
      });
      writeJson(path.join(projectRoot, 'node_modules/@scope/lib/node_modules/react/package.json'), {
        name: 'react',
        version: '18.3.1',
      });
      writeJson(path.join(projectRoot, 'node_modules/no-version/package.json'), { name: 'no-version' });

      const result = getBundledPackagesFromModulePaths([
        path.join(projectRoot, 'index.js'),
        path.join(projectRoot, 'node_modules/react/index.js'),
        path.join(projectRoot, 'node_modules/react/cjs/react.production.js'),
        path.join(projectRoot, 'node_modules/@scope/lib/dist/index.js'),
        path.join(projectRoot, 'node_modules/@scope/lib/node_modules/react/index.js'),
        path.join(projectRoot, 'node_modules/no-version/index.js'),
      ]);

      expect([...result.packageKeys].sort()).toEqual(['@scope/lib@2.1.0', 'app@0.0.1', 'react@18.3.1', 'react@19.0.0']);
      expect([...result.packageNames].sort()).toEqual(['@scope/lib', 'app', 'no-version', 'react']);
      expect(result.modulePaths).toHaveLength(6);
    });

    it('should ignore modules without a package.json up the tree', () => {
      const result = getBundledPackagesFromModulePaths([path.join(projectRoot, 'orphan/index.js')]);

      expect(result.packageKeys.size).toBe(0);
      expect(result.packageNames.size).toBe(0);
    });
  });

  describe('getModulePathsFromSourceMaps', () => {
    it('should collect sources from all source maps, resolving relative paths against the project root', () => {
      const outputDir = path.join(projectRoot, 'dist');

      touch(path.join(projectRoot, 'node_modules/react/index.js'));
      touch(path.join(projectRoot, 'App.tsx'));

      writeJson(path.join(outputDir, '_expo/static/js/ios/entry.js.map'), {
        version: 3,
        sources: [
          '__prelude__',
          'node_modules/react/index.js',
          path.join(projectRoot, 'App.tsx'),
          '<anonymous>',
          '\0polyfill:x',
        ],
      });
      writeJson(path.join(outputDir, '_expo/static/js/android/entry.js.map'), {
        version: 3,
        sources: ['node_modules/react/index.js', '/App.tsx'],
      });
      touch(path.join(outputDir, 'not-a-map.json'), '{}');
      touch(path.join(outputDir, 'broken.map'), '{ not json');

      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      const result = getModulePathsFromSourceMaps(outputDir, projectRoot);

      expect(result.sort()).toEqual(
        [path.join(projectRoot, 'node_modules/react/index.js'), path.join(projectRoot, 'App.tsx')].sort(),
      );
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('could not parse source map'));

      warnSpy.mockRestore();
    });

    it('should resolve sources relative to the Metro server root (monorepo root) and attribute virtual modules to their package', () => {
      const monorepoRoot = projectRoot;
      const appRoot = path.join(monorepoRoot, 'apps/mobile');
      const outputDir = path.join(appRoot, 'dist');

      writeJson(path.join(monorepoRoot, 'package.json'), { name: 'monorepo', private: true });
      writeJson(path.join(appRoot, 'package.json'), { name: 'mobile', version: '1.0.0' });
      touch(path.join(appRoot, 'index.js'));
      writeJson(path.join(monorepoRoot, 'node_modules/expo/package.json'), { name: 'expo', version: '56.0.0' });
      touch(path.join(monorepoRoot, 'node_modules/expo/src/Expo.ts'));
      writeJson(path.join(appRoot, 'node_modules/nested/package.json'), { name: 'nested', version: '1.0.0' });
      touch(path.join(appRoot, 'node_modules/nested/index.js'));

      writeJson(path.join(outputDir, 'entry.js.map'), {
        version: 3,
        sources: [
          '/apps/mobile/index.js',
          '/node_modules/expo/src/Expo.ts',
          '/node_modules/expo/virtual/streams.js',
          '/node_modules/nested/index.js',
          '/node_modules/missing/index.js',
        ],
      });

      const result = getModulePathsFromSourceMaps(outputDir, appRoot);

      expect(result.sort()).toEqual(
        [
          path.join(appRoot, 'index.js'),
          path.join(monorepoRoot, 'node_modules/expo/src/Expo.ts'),
          path.join(monorepoRoot, 'node_modules/expo/virtual/streams.js'),
          path.join(appRoot, 'node_modules/nested/index.js'),
        ].sort(),
      );
    });
  });

  describe('getBundledPackages', () => {
    it("should run metro get-dependencies per platform for the 'metro' source and union the results", () => {
      writeJson(path.join(projectRoot, 'package.json'), { name: 'app', version: '1.0.0' });
      touch(path.join(projectRoot, 'index.js'));
      writeJson(path.join(projectRoot, 'node_modules/metro/package.json'), {
        name: 'metro',
        version: '0.84.0',
        bin: { metro: 'src/cli.js' },
      });
      touch(path.join(projectRoot, 'node_modules/metro/src/cli.js'));
      writeJson(path.join(projectRoot, 'node_modules/react/package.json'), { name: 'react', version: '19.0.0' });
      writeJson(path.join(projectRoot, 'node_modules/ios-only/package.json'), { name: 'ios-only', version: '1.0.0' });
      writeJson(path.join(projectRoot, 'node_modules/android-only/package.json'), {
        name: 'android-only',
        version: '1.0.0',
      });

      spawnSyncMock.mockImplementation(((_execPath: string, args: string[]) => {
        const platform = args[args.indexOf('--platform') + 1];
        const outputFile = args[args.indexOf('--output') + 1];

        fs.writeFileSync(
          outputFile,
          [
            path.join(projectRoot, 'index.js'),
            path.join(projectRoot, 'node_modules/react/index.js'),
            path.join(projectRoot, `node_modules/${platform}-only/index.js`),
            '',
          ].join('\n'),
        );

        return { status: 0, stdout: '', stderr: '', pid: 1, output: [], signal: null };
      }) as any);

      const result = getBundledPackages({ projectRoot, source: 'metro' });

      expect(spawnSyncMock).toHaveBeenCalledTimes(2);

      const [execPath, args, spawnOptions] = spawnSyncMock.mock.calls[0];

      expect(execPath).toBe(process.execPath);
      expect(args).toEqual([
        path.join(projectRoot, 'node_modules/metro/src/cli.js'),
        'get-dependencies',
        '--entry-file',
        path.join(projectRoot, 'index.js'),
        '--platform',
        'ios',
        '--no-dev',
        '--output',
        expect.stringMatching(/ios\.txt$/),
      ]);
      expect(spawnOptions).toEqual(expect.objectContaining({ cwd: projectRoot }));
      expect(spawnSyncMock.mock.calls[1][1]).toContain('android');

      expect([...result.packageKeys].sort()).toEqual([
        'android-only@1.0.0',
        'app@1.0.0',
        'ios-only@1.0.0',
        'react@19.0.0',
      ]);
    });

    it("should respect the 'platforms', 'dev' and 'entryFile' options", () => {
      writeJson(path.join(projectRoot, 'package.json'), { name: 'app', version: '1.0.0' });
      touch(path.join(projectRoot, 'src/entry.ts'));
      writeJson(path.join(projectRoot, 'node_modules/metro/package.json'), {
        name: 'metro',
        version: '0.84.0',
        bin: { metro: 'src/cli.js' },
      });
      touch(path.join(projectRoot, 'node_modules/metro/src/cli.js'));

      spawnSyncMock.mockReturnValue({ status: 0, stdout: '', stderr: '', pid: 1, output: [], signal: null } as any);

      getBundledPackages({
        projectRoot,
        source: 'metro',
        platforms: ['android'],
        dev: true,
        entryFile: 'src/entry.ts',
      });

      expect(spawnSyncMock).toHaveBeenCalledTimes(1);

      const args = spawnSyncMock.mock.calls[0][1] as string[];

      expect(args).toContain('--dev');
      expect(args).not.toContain('--no-dev');
      expect(args[args.indexOf('--platform') + 1]).toBe('android');
      expect(args[args.indexOf('--entry-file') + 1]).toBe(path.join(projectRoot, 'src/entry.ts'));
    });

    it('should throw a descriptive error when metro is not installed', () => {
      writeJson(path.join(projectRoot, 'package.json'), { name: 'app', version: '1.0.0' });
      touch(path.join(projectRoot, 'index.js'));

      expect(() => getBundledPackages({ projectRoot, source: 'metro' })).toThrow("could not find 'metro' installed");
      expect(spawnSyncMock).not.toHaveBeenCalled();
    });

    it('should throw when the underlying command fails', () => {
      writeJson(path.join(projectRoot, 'package.json'), { name: 'app', version: '1.0.0' });
      touch(path.join(projectRoot, 'index.js'));
      writeJson(path.join(projectRoot, 'node_modules/metro/package.json'), {
        name: 'metro',
        version: '0.84.0',
        bin: { metro: 'src/cli.js' },
      });
      touch(path.join(projectRoot, 'node_modules/metro/src/cli.js'));

      spawnSyncMock.mockReturnValue({
        status: 1,
        stdout: '',
        stderr: 'Unable to resolve module',
        pid: 1,
        output: [],
        signal: null,
      } as any);

      expect(() => getBundledPackages({ projectRoot, source: 'metro', platforms: ['ios'] })).toThrow(
        /metro get-dependencies \(ios\) exited with code 1:\nUnable to resolve module/,
      );
    });

    it("should run expo export with source maps for the 'expo' source and read modules from the emitted source maps", () => {
      writeJson(path.join(projectRoot, 'package.json'), {
        name: 'app',
        version: '1.0.0',
        dependencies: { expo: '^56.0.0' },
      });
      writeJson(path.join(projectRoot, 'node_modules/expo/package.json'), {
        name: 'expo',
        version: '56.0.0',
        bin: { expo: 'bin/cli' },
      });
      touch(path.join(projectRoot, 'node_modules/expo/bin/cli'));
      writeJson(path.join(projectRoot, 'node_modules/react/package.json'), { name: 'react', version: '19.0.0' });
      touch(path.join(projectRoot, 'node_modules/react/index.js'));
      touch(path.join(projectRoot, 'App.tsx'));

      spawnSyncMock.mockImplementation(((_execPath: string, args: string[]) => {
        const platform = args[args.indexOf('--platform') + 1];
        const outputDir = args[args.indexOf('--output-dir') + 1];

        writeJson(path.join(outputDir, `_expo/static/js/${platform}/entry.js.map`), {
          version: 3,
          sources: ['__prelude__', 'node_modules/react/index.js', 'App.tsx'],
        });

        return { status: 0, stdout: '', stderr: '', pid: 1, output: [], signal: null };
      }) as any);

      const result = getBundledPackages({ projectRoot, platforms: ['ios'], resetCache: true });

      expect(spawnSyncMock).toHaveBeenCalledTimes(1);

      const args = spawnSyncMock.mock.calls[0][1] as string[];

      expect(args[0]).toBe(path.join(projectRoot, 'node_modules/expo/bin/cli'));
      expect(args.slice(1)).toEqual([
        'export',
        '--platform',
        'ios',
        '--output-dir',
        expect.any(String),
        '--source-maps',
        'true',
        '--no-minify',
        '--no-bytecode',
        '--clear',
      ]);
      expect([...result.packageKeys].sort()).toEqual(['app@1.0.0', 'react@19.0.0']);
      // temporary export directory is cleaned up
      expect(fs.existsSync(args[args.indexOf('--output-dir') + 1])).toBe(false);
    });
  });

  describe('filterLicensesByBundledPackages', () => {
    it('should keep only the licenses of bundled packages, matched by name@version key', () => {
      const licenses: AggregatedLicensesMapping = {
        'react@19.0.0': makeLicense({ name: 'react', version: '19.0.0' }),
        'react@18.3.1': makeLicense({ name: 'react', version: '18.3.1' }),
        'unused@1.0.0': makeLicense({ name: 'unused', version: '1.0.0' }),
      };

      const result = filterLicensesByBundledPackages(licenses, {
        packageKeys: new Set(['react@19.0.0']),
        packageNames: new Set(['react']),
      });

      expect(Object.keys(result)).toEqual(['react@19.0.0']);
      expect(result['react@19.0.0']).toBe(licenses['react@19.0.0']);
    });

    it('should fall back to matching by name for packages without a version', () => {
      const licenses: AggregatedLicensesMapping = {
        'no-version@undefined': makeLicense({ name: 'no-version', version: undefined as any }),
        'other@undefined': makeLicense({ name: 'other', version: undefined as any }),
      };

      const result = filterLicensesByBundledPackages(licenses, {
        packageKeys: new Set(),
        packageNames: new Set(['no-version']),
      });

      expect(Object.keys(result)).toEqual(['no-version@undefined']);
    });

    it('should not mutate the input mapping', () => {
      const licenses: AggregatedLicensesMapping = {
        'react@19.0.0': makeLicense({ name: 'react', version: '19.0.0' }),
      };

      filterLicensesByBundledPackages(licenses, { packageKeys: new Set(), packageNames: new Set() });

      expect(Object.keys(licenses)).toEqual(['react@19.0.0']);
    });
  });
});
