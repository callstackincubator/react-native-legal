import child_process from 'node:child_process';

describe('license-kit report', () => {
  it('should report licenses', async () => {
    const output = await new Promise<string>((resolve) => {
      child_process.exec('yarn workspace license-kit-node-example report', (_, stdout) => {
        resolve(stdout);
      });
    });

    const json = JSON.parse(output);

    expect(json['dhtmlx-gantt'].type).toMatch('GPL-2.0');
    expect(json['is-even'].content).toMatch('MIT License');
    expect(json['is-even'].type).toMatch('MIT');
    expect(json.mariadb.content).toMatch('GNU LESSER GENERAL PUBLIC LICENSE');
    expect(json.mariadb.type).toMatch('LGPL-2.1-or-later');
    expect(json.zustand.content).toMatch('MIT License');
    expect(json.zustand.type).toMatch('MIT');
  });
});
