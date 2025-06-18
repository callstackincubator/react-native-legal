import child_process from 'node:child_process';

import {
  dependencies as licenseKitDependenciesObj,
  devDependencies as licenseKitDevDependenciesObj,
} from '../../../packages/license-kit/package.json';
import {
  dependencies as sharedDependenciesObj,
  devDependencies as sharedDevDependenciesObj,
} from '../../../packages/shared/package.json';
import { dependencies as dependenciesObj, devDependencies as devDependenciesObj } from '../package.json';

const dependencies = Object.keys(dependenciesObj).sort();
const devDependencies = Object.keys(devDependenciesObj).sort();
const licenseKitDependencies = Object.keys(licenseKitDependenciesObj).sort();
const licenseKitDevDependencies = Object.keys(licenseKitDevDependenciesObj).sort();
const sharedDependencies = Object.keys(sharedDependenciesObj).sort();
const sharedDevDependencies = Object.keys(sharedDevDependenciesObj).sort();

async function runReportCommandForJsonOutput(args: string[] = []) {
  const command = `yarn workspace license-kit-node-example report${args ? ` ${args.join(' ')}` : ''}`;

  const output = await new Promise<string>((resolve) => {
    child_process.exec(command, (_, stdout) => {
      resolve(stdout);
    });
  });

  return JSON.parse(output);
}

describe('license-kit report', () => {
  it('including transitive deps, with dev deps with default settings', async () => {
    const json = await runReportCommandForJsonOutput();

    expect(json['dhtmlx-gantt'].type).toMatch('GPL-2.0');
    expect(json['is-even'].content).toMatch('MIT License');
    expect(json['is-even'].type).toMatch('MIT');
    expect(json.mariadb.content).toMatch('GNU LESSER GENERAL PUBLIC LICENSE');
    expect(json.mariadb.type).toMatch('LGPL-2.1-or-later');
    expect(json.zustand.content).toMatch('MIT License');
    expect(json.zustand.type).toMatch('MIT');
  });

  it('without transitive deps and without dev deps', async () => {
    const json = await runReportCommandForJsonOutput(['--dev-deps-mode', 'none', '--transitive-deps-mode', 'none']);

    expect(Object.keys(json).toSorted()).toEqual(dependencies.toSorted());
  });

  it('without transitive deps and with root-only dev deps', async () => {
    const json = await runReportCommandForJsonOutput([
      '--dev-deps-mode',
      'root-only',
      '--transitive-deps-mode',
      'none',
    ]);

    expect(Object.keys(json).toSorted()).toEqual(Array.from(new Set([...dependencies, ...devDependencies])).toSorted());
  });

  it('with root-only dev deps and with transitive dependencies of workspace-specifier-only dependencies', async () => {
    const json = await runReportCommandForJsonOutput([
      '--dev-deps-mode',
      'root-only',
      '--transitive-deps-mode',
      'from-workspace-only',
    ]);

    expect(Object.keys(json).toSorted()).toEqual(
      Array.from(new Set([...dependencies, ...devDependencies, ...licenseKitDependencies])).toSorted(),
    );
  });

  it('without dev deps and with transitive dependencies of external dependencies only', async () => {
    const json = await runReportCommandForJsonOutput([
      '--dev-deps-mode',
      'none',
      '--transitive-deps-mode',
      'from-external-only',
    ]);

    const resultKeys = Object.keys(json);

    expect(resultKeys.toSorted()).toEqual([
      '@types/geojson',
      '@types/node',
      'denque',
      'dhtmlx-gantt',
      'iconv-lite',
      'is-even',
      'is-number',
      'is-odd',
      'lru-cache',
      'mariadb',
      'safer-buffer',
      'undici-types',
      'yallist',
      'zustand',
    ]);

    expect(resultKeys).not.toIncludeAllMembers(licenseKitDependencies);
    expect(resultKeys).not.toIncludeAllMembers(licenseKitDevDependencies);
  });

  it('with root-only dev deps and with transitive dependencies of external dependencies only', async () => {
    const json = await runReportCommandForJsonOutput([
      '--dev-deps-mode',
      'root-only',
      '--transitive-deps-mode',
      'from-external-only',
    ]);

    const resultKeys = Object.keys(json);

    expect(resultKeys).toContain('license-kit');

    // this time, the result should also include all dependencies of the direct devDependencies of the root package.json
    expect(resultKeys.length).toBeGreaterThan(200);
    expect(resultKeys).toIncludeAllMembers([
      '@babel/plugin-transform-async-to-generator',
      '@babel/plugin-transform-block-scoped-functions',
      '@babel/plugin-transform-block-scoping',
      '@babel/plugin-transform-class-properties',
      '@babel/helper-create-class-features-plugin',
      '@babel/helper-member-expression-to-functions',
    ]);

    expect(resultKeys).not.toIncludeAllMembers(licenseKitDependencies);
    expect(resultKeys).not.toIncludeAllMembers(licenseKitDevDependencies);

    // note: sharedDependencies should not be included, yet they contain glob, which is a transitive dependency of something else
    expect(resultKeys).not.toIncludeAllMembers(sharedDevDependencies);
  });

  it('with root-only dev deps and with all transitive dependencies', async () => {
    const json = await runReportCommandForJsonOutput(['--dev-deps-mode', 'root-only', '--transitive-deps-mode', 'all']);

    const resultKeys = Object.keys(json);

    // this time, the result should also include all transitive dependencies of direct devDependencies of the root package.json,
    // such as that of license-kit itself (which is a direct devDependency of the root package.json)
    expect(resultKeys.length).toBeGreaterThan(300);
    expect(resultKeys).toContain('license-kit');
    expect(resultKeys).toContain('@callstack/react-native-legal-shared');

    expect(resultKeys).toIncludeAllMembers(licenseKitDependencies);
    expect(resultKeys).not.toIncludeAllMembers(licenseKitDevDependencies);

    expect(resultKeys).toIncludeAllMembers(sharedDependencies);
    expect(resultKeys).not.toIncludeAllMembers(sharedDevDependencies);
  });
});
