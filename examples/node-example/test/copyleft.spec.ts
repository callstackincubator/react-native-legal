import child_process from 'node:child_process';

describe('license-kit copyleft', () => {
  it('should report error for strong copyleft licenses', async () => {
    const output = await new Promise<string>((resolve) => {
      child_process.exec('yarn workspace license-kit-node-example copyleft', (_, __, stderr) => {
        resolve(stderr);
      });
    });

    expect(output).toMatch('Copyleft licenses found in the following dependencies:');
    expect(output).toMatch('dhtmlx-gantt: GPL-2.0');
  });
  it('should report error for strong and weak copyleft licenses', async () => {
    const output = await new Promise<string>((resolve) => {
      child_process.exec('yarn workspace license-kit-node-example weak-copyleft', (_, __, stderr) => {
        resolve(stderr);
      });
    });

    expect(output).toMatch('Copyleft licenses found in the following dependencies:');
    expect(output).toMatch('dhtmlx-gantt: GPL-2.0');
    expect(output).toMatch('Weak copyleft licenses found in the following dependencies:');
    expect(output).toMatch('mariadb: LGPL-2.1-or-later');
  });
});
