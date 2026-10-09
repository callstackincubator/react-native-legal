import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { parseLicenseExpression } from '../../licenses/licenseExpression';
import type { LicenseFile } from '../../types';
import type { License } from '../../types/License';
import { findPackageRoot, generateLicensePlistNPMOutput, scanPackageRoots } from '../common';

const makeLicense = (licenseFiles: LicenseFile[]) =>
  ({
    name: '@scope/pkg',
    version: '1.0.0',
    dependencyType: 'dependency',
    requiredVersion: '1.0.0',
    parentPackages: [],
    rawLicense: 'MIT OR Apache-2.0',
    license: parseLicenseExpression('MIT OR Apache-2.0'),
    licenseIds: ['MIT', 'Apache-2.0'],
    licenseFiles,
  }) satisfies License;

describe('generateLicensePlistNPMOutput', () => {
  it('when a package has several license files, then the body has every text under its License Identifier heading', () => {
    const yaml = generateLicensePlistNPMOutput(
      {
        '@scope/pkg@1.0.0': makeLicense([
          { file: '/p/LICENSE-APACHE', content: 'Apache-2.0 half', licenseId: 'Apache-2.0' },
          { file: '/p/LICENSE-MIT', content: 'MIT half', licenseId: 'MIT' },
        ]),
      },
      '/ios',
    );

    expect(yaml).toContain('=== Apache-2.0 ===');
    expect(yaml).toContain('Apache-2.0 half');
    expect(yaml).toContain('=== MIT ===');
    expect(yaml).toContain('MIT half');
  });

  it('when a package has one license file, then the entry references it relative to the iOS project', () => {
    const yaml = generateLicensePlistNPMOutput(
      { '@scope/pkg@1.0.0': makeLicense([{ file: '/project/node_modules/pkg/LICENSE', content: 'text' }]) },
      '/project/ios',
    );

    expect(yaml).toContain("file: '../node_modules/pkg/LICENSE'");
    expect(yaml).not.toContain('body');
  });
});

// Creates a fake package on disk: a folder with package.json and (optionally) a LICENSE file
function createPackage(root: string, packageJson: object | string, licenseContent?: string) {
  fs.mkdirSync(root, { recursive: true });
  fs.writeFileSync(
    path.join(root, 'package.json'),
    // a string lets us write broken JSON on purpose
    typeof packageJson === 'string' ? packageJson : JSON.stringify(packageJson),
  );

  if (licenseContent !== undefined) {
    fs.writeFileSync(path.join(root, 'LICENSE'), licenseContent);
  }

  return root;
}

describe('scanPackageRoots', () => {
  let tmpDir: string;
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    // a fresh, empty temp folder for every test, so tests don't affect each other
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'scan-package-roots-'));
    // replace console.warn with a silent "spy", which records calls without printing
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    warnSpy.mockRestore(); // put the real console.warn back
  });

  it('should collect license information of a package', () => {
    const root = createPackage(
      path.join(tmpDir, 'node_modules', 'pkg-a'),
      {
        name: 'pkg-a',
        version: '1.2.3',
        description: 'Package A',
        license: 'MIT',
        author: 'John Doe',
        repository: 'https://github.com/example/pkg-a',
      },
      'MIT License text',
    );

    const result = scanPackageRoots([root]);

    expect(Object.keys(result)).toEqual(['pkg-a@1.2.3']);
    expect(result['pkg-a@1.2.3']).toEqual({
      name: 'pkg-a',
      version: '1.2.3',
      description: 'Package A',
      rawLicense: 'MIT',
      license: parseLicenseExpression('MIT'),
      licenseIds: ['MIT'],
      licenseFiles: [{ file: path.join(root, 'LICENSE'), content: 'MIT License text' }],
      author: 'John Doe',
      url: 'https://github.com/example/pkg-a',
      dependencyType: 'dependency',
      requiredVersion: '1.2.3',
      parentPackages: [],
    });
  });

  // Scoped packages:
  it('should support scoped packages', () => {
    const root = createPackage(path.join(tmpDir, 'node_modules', '@scope', 'pkg'), {
      name: '@scope/pkg',
      version: '2.0.0',
    });

    expect(Object.keys(scanPackageRoots([root]))).toEqual(['@scope/pkg@2.0.0']);
  });

  // No LICENSE file. The package is still included, just without license text:
  it('should return no license files when the package has no LICENSE file', () => {
    const root = createPackage(path.join(tmpDir, 'pkg-no-license'), { name: 'pkg-no-license', version: '1.0.0' });

    const result = scanPackageRoots([root]);

    expect(result['pkg-no-license@1.0.0'].licenseFiles).toEqual([]);
  });

  // The two skip rules:
  it('should skip private packages', () => {
    const root = createPackage(path.join(tmpDir, 'private-pkg'), {
      name: 'private-pkg',
      version: '1.0.0',
      private: true,
    });

    expect(scanPackageRoots([root])).toEqual({});
  });

  it('should skip packages without a name', () => {
    const root = createPackage(path.join(tmpDir, 'nameless'), { version: '1.0.0' });

    expect(scanPackageRoots([root])).toEqual({});
  });

  // The two warning cases. The second one also proves that one broken package doesn't stop the others:
  it('should skip and warn when package.json does not exist', () => {
    const root = path.join(tmpDir, 'missing'); // never created

    expect(scanPackageRoots([root])).toEqual({});
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('could not find package.json'));
  });

  it('should skip and warn when package.json is invalid, and continue with other packages', () => {
    const brokenRoot = createPackage(path.join(tmpDir, 'broken'), '{ not valid json');
    const validRoot = createPackage(path.join(tmpDir, 'valid'), { name: 'valid', version: '1.0.0' });

    const result = scanPackageRoots([brokenRoot, validRoot]);

    expect(Object.keys(result)).toEqual(['valid@1.0.0']);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('could not process package.json'));
  });

  // The same package installed twice (nested node_modules) gives one entry:
  it('should keep a single entry for the same package version installed in two locations', () => {
    const first = createPackage(path.join(tmpDir, 'node_modules', 'dup'), { name: 'dup', version: '1.0.0' });
    const second = createPackage(path.join(tmpDir, 'node_modules', 'other', 'node_modules', 'dup'), {
      name: 'dup',
      version: '1.0.0',
    });

    expect(Object.keys(scanPackageRoots([first, second]))).toEqual(['dup@1.0.0']);
  });
});

describe('findPackageRoot', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'find-package-root-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('should return the directory itself when it contains a named package.json', () => {
    const root = createPackage(path.join(tmpDir, 'node_modules', 'pkg'), { name: 'pkg', version: '1.0.0' });

    expect(findPackageRoot(root)).toBe(root);
  });

  it('should find the package root from a nested directory', () => {
    const root = createPackage(path.join(tmpDir, 'node_modules', '@scope', 'pkg'), { name: '@scope/pkg' });
    const nestedDir = path.join(root, 'lib', 'module');

    fs.mkdirSync(nestedDir, { recursive: true });

    expect(findPackageRoot(nestedDir)).toBe(root);
  });

  it('should skip nested package.json files without a name', () => {
    const root = createPackage(path.join(tmpDir, 'node_modules', 'pkg'), { name: 'pkg' });
    const commonjsDir = path.join(root, 'lib', 'commonjs');

    createPackage(commonjsDir, { type: 'commonjs' });

    expect(findPackageRoot(commonjsDir)).toBe(root);
  });

  it('should skip invalid package.json files', () => {
    const root = createPackage(path.join(tmpDir, 'pkg'), { name: 'pkg' });
    const brokenDir = createPackage(path.join(root, 'broken'), '{ not valid json');

    expect(findPackageRoot(brokenDir)).toBe(root);
  });

  it('should find the innermost package for nested node_modules', () => {
    createPackage(path.join(tmpDir, 'node_modules', 'a'), { name: 'a' });
    const inner = createPackage(path.join(tmpDir, 'node_modules', 'a', 'node_modules', 'b'), { name: 'b' });

    expect(findPackageRoot(inner)).toBe(inner);
  });

  it('should find workspace packages which are not inside node_modules', () => {
    const workspacePackage = createPackage(path.join(tmpDir, 'packages', 'my-lib'), { name: 'my-lib' });
    const srcDir = path.join(workspacePackage, 'src');

    fs.mkdirSync(srcDir);

    expect(findPackageRoot(srcDir)).toBe(workspacePackage);
  });
});
