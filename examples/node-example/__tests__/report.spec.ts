import child_process from 'node:child_process';
import { platform } from 'node:os';

import {
  dependencies as licenseKitDependenciesObj,
  devDependencies as licenseKitDevDependenciesObj,
  version as licenseKitVersion,
} from '../../../packages/license-kit/package.json';
import {
  dependencies as sharedDependenciesObj,
  devDependencies as sharedDevDependenciesObj,
} from '../../../packages/licenses-api/package.json';
import {
  dependencyMappingToCorrespondingKey,
  getDependencyCorrespondingKey,
  stripVersionSuffixes,
} from '../__utils__/utils';
import {
  dependencies as dependenciesObj,
  devDependencies as devDependenciesObj,
  optionalDependencies as optionalDependenciesObj,
} from '../package.json';

// do not expect the private test package to be in the assertions baseline, it shall be excluded
const dependencies = dependencyMappingToCorrespondingKey(dependenciesObj).filter(
  (dep) => dep !== '@callstack/example-private-package@workspace:*',
);
const devDependencies = dependencyMappingToCorrespondingKey(devDependenciesObj);
const optionalDependencies = dependencyMappingToCorrespondingKey(optionalDependenciesObj);
const licenseKitDependencies = dependencyMappingToCorrespondingKey(licenseKitDependenciesObj);
const licenseKitDevDependencies = dependencyMappingToCorrespondingKey(licenseKitDevDependenciesObj);
const sharedDependencies = dependencyMappingToCorrespondingKey(sharedDependenciesObj);
const sharedDevDependencies = dependencyMappingToCorrespondingKey(sharedDevDependenciesObj);

// below: correct the expected license-kit version (expected result) to match the actual version instead of specified version
devDependencies[Object.keys(devDependenciesObj).indexOf('license-kit')] = `license-kit@${licenseKitVersion}`;

async function runReportCommandForJsonOutput(args: string[] = []) {
  const command = `yarn workspace license-kit-node-example report${args ? ` ${args.join(' ')}` : ''}`;

  const output = await new Promise<string>((resolve) => {
    child_process.exec(
      command,
      {
        maxBuffer: 1024 * 1024 * 100, // 100MB
      },
      (_, stdout) => {
        resolve(stdout);
      },
    );
  });

  return JSON.parse(output);
}

describe('license-kit report', () => {
  it('including transitive deps, with dev deps with default settings', async () => {
    const json = await runReportCommandForJsonOutput();

    const isEvenPackageKey = getDependencyCorrespondingKey(dependenciesObj, 'is-even');
    const mariadbPackageKey = getDependencyCorrespondingKey(dependenciesObj, 'mariadb');
    const zustandPackageKey = getDependencyCorrespondingKey(dependenciesObj, 'zustand');

    expect(json[getDependencyCorrespondingKey(dependenciesObj, 'dhtmlx-gantt')].type).toMatch('GPL-2.0');
    expect(json[isEvenPackageKey].content).toMatch('MIT License');
    expect(json[isEvenPackageKey].type).toMatch('MIT');
    expect(json[mariadbPackageKey].content).toMatch('GNU LESSER GENERAL PUBLIC LICENSE');
    expect(json[mariadbPackageKey].type).toMatch('LGPL-2.1-or-later');
    expect(json[zustandPackageKey].content).toMatch('MIT License');
    expect(json[zustandPackageKey].type).toMatch('MIT');
  });

  it('without transitive deps and without dev deps', async () => {
    const json = await runReportCommandForJsonOutput(['--dev-deps-mode', 'none', '--transitive-deps-mode', 'none']);

    expect(stripVersionSuffixes(Object.keys(json).toSorted())).toEqual(
      stripVersionSuffixes([...dependencies, ...optionalDependencies].toSorted()),
    );
  });

  it('without transitive deps and with root-only dev deps', async () => {
    const json = await runReportCommandForJsonOutput([
      '--dev-deps-mode',
      'root-only',
      '--transitive-deps-mode',
      'none',
    ]);

    expect(stripVersionSuffixes(Object.keys(json).toSorted())).toEqual(
      stripVersionSuffixes(
        Array.from(new Set([...dependencies, ...optionalDependencies, ...devDependencies])).toSorted(),
      ),
    );
  });

  it("does not include private packages' licenses", async () => {
    const json = await runReportCommandForJsonOutput();

    expect(Object.keys(json).toSorted()).not.toIncludeAllMembers(['@callstack/example-private-package']);
  });

  it('with root-only dev deps and with transitive dependencies of workspace-specifier-only dependencies', async () => {
    const json = await runReportCommandForJsonOutput([
      '--dev-deps-mode',
      'root-only',
      '--transitive-deps-mode',
      'from-workspace-only',
    ]);

    expect(stripVersionSuffixes(Object.keys(json).toSorted())).toEqual(
      stripVersionSuffixes(
        Array.from(
          new Set([...dependencies, ...devDependencies, ...licenseKitDependencies, ...optionalDependencies]),
        ).toSorted(),
      ),
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

    expect(stripVersionSuffixes(resultKeys.toSorted())).toEqual([
      '@types/geojson',
      '@types/node',
      'chartjs-plugin-dragdata',
      'd3-dispatch',
      'd3-drag',
      'd3-selection',
      'denque',
      'dhtmlx-gantt',
      'iconv-lite',
      'is-buffer',
      'is-even',
      'is-number',
      'is-odd',
      'kind-of',
      'lru-cache',
      'mariadb',
      'safer-buffer',
      'undici-types',
      'zustand',
    ]);

    expect(resultKeys).not.toIncludeAnyMembers(licenseKitDependencies);
    expect(resultKeys).not.toIncludeAnyMembers(licenseKitDevDependencies);
  });

  it('with root-only dev deps and with transitive dependencies of external dependencies only', async () => {
    const json = await runReportCommandForJsonOutput([
      '--dev-deps-mode',
      'root-only',
      '--transitive-deps-mode',
      'from-external-only',
    ]);

    const resultKeys = Object.keys(json);

    expect(resultKeys).toContain(`license-kit@${licenseKitVersion}`);

    // this time, the result should also include all dependencies of the direct devDependencies of the root package.json
    expect(resultKeys.length).toBeGreaterThan(200);
    expect(stripVersionSuffixes(resultKeys)).toIncludeAllMembers([
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
    const resultKeysWithoutVersions = stripVersionSuffixes(resultKeys);

    // this time, the result should also include all transitive dependencies of direct devDependencies of the root package.json,
    // such as that of license-kit itself (which is a direct devDependency of the root package.json)
    expect(resultKeys.length).toBeGreaterThan(300);
    expect(resultKeysWithoutVersions).toContain('license-kit');
    expect(resultKeysWithoutVersions).toContain('@callstack/licenses');

    expect(resultKeysWithoutVersions).toIncludeAllMembers(stripVersionSuffixes(licenseKitDependencies));
    expect(resultKeysWithoutVersions).not.toIncludeAllMembers(stripVersionSuffixes(licenseKitDevDependencies));

    expect(resultKeysWithoutVersions).toIncludeAllMembers(stripVersionSuffixes(sharedDependencies));
    expect(resultKeysWithoutVersions).not.toIncludeAllMembers(stripVersionSuffixes(sharedDevDependencies));
  });

  it('without optional dependencies disabled', async () => {
    const json = await runReportCommandForJsonOutput(['--include-optional-deps', 'false']);

    const resultKeys = Object.keys(json);

    // license-kit has a devDependency on tsx, which has an optionalDependency on fsevents
    expect(stripVersionSuffixes(resultKeys)).not.toContain('fsevents');
    expect(resultKeys).not.toIncludeAnyMembers(optionalDependencies);
  });

  it('with optional dependencies enabled', async () => {
    const json = await runReportCommandForJsonOutput(['--include-optional-deps', 'true']);

    const resultKeys = Object.keys(json);

    // license-kit has a devDependency on tsx, which has an optionalDependency on fsevents
    if (platform() === 'darwin') {
      // eslint-disable-next-line jest/no-conditional-expect -- fsevents is macOS-only
      expect(stripVersionSuffixes(resultKeys)).toContain('fsevents');
    }

    expect(resultKeys).toIncludeAnyMembers(optionalDependencies);
  });
});
