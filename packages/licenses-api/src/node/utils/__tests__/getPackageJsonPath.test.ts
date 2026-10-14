import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { getPackageJsonPath } from '../packageUtils';

function writePackage(dir: string, packageJson: Record<string, unknown>) {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify(packageJson));
}

describe('getPackageJsonPath', () => {
  let tmp: string;

  beforeEach(() => {
    tmp = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'rnl-get-package-json-path-')));
  });

  afterEach(() => {
    jest.restoreAllMocks();
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it('searches process.cwd() when no project root is given', () => {
    const cwd = path.join(tmp, 'elsewhere');

    writePackage(path.join(cwd, 'node_modules', 'fixture-shared'), { name: 'fixture-shared', version: '9.9.9' });
    jest.spyOn(process, 'cwd').mockReturnValue(cwd);

    expect(getPackageJsonPath('fixture-shared')).toBe(path.join(cwd, 'node_modules', 'fixture-shared', 'package.json'));
  });

  it('searches node_modules in the filesystem root too', () => {
    const packageJsonPath = path.join(
      path.parse(tmp).root,
      'node_modules',
      'fixture-in-filesystem-root',
      'package.json',
    );
    const { existsSync, realpathSync } = fs;

    jest.spyOn(fs, 'existsSync').mockImplementation((file) => file === packageJsonPath || existsSync(file));
    jest
      .spyOn(fs, 'realpathSync')
      .mockImplementation((file) => (file === packageJsonPath ? packageJsonPath : realpathSync(file)));

    expect(getPackageJsonPath('fixture-in-filesystem-root', undefined, tmp)).toBe(packageJsonPath);
  });
});
