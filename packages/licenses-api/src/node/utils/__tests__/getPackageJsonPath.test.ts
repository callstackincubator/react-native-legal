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
});
