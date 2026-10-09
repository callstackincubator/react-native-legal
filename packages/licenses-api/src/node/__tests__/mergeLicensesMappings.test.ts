import { parseLicenseExpression } from '../../licenses/licenseExpression';
import type { License } from '../../types';
import { mergeLicensesMappings } from '../mergeLicensesMappings';

function license(name: string, version: string, overrides: Partial<License> = {}): License {
  return {
    name,
    version,
    rawLicense: 'MIT',
    license: parseLicenseExpression('MIT'),
    licenseIds: ['MIT'],
    licenseFiles: [],
    dependencyType: 'dependency',
    requiredVersion: version,
    parentPackages: [],
    ...overrides,
  };
}

function mutateEveryObjectAndArray(value: unknown) {
  if (Array.isArray(value)) {
    value.forEach(mutateEveryObjectAndArray);
    value.push('mutated');
  } else if (typeof value === 'object' && value !== null) {
    Object.values(value).forEach(mutateEveryObjectAndArray);
    Object.assign(value, { mutated: true });
  }
}

describe('mergeLicensesMappings', () => {
  it('contains the entries of all mappings, in order of first appearance', () => {
    const merged = mergeLicensesMappings({ 'a@1.0.0': license('a', '1.0.0') }, { 'b@2.0.0': license('b', '2.0.0') });

    expect(Object.keys(merged)).toEqual(['a@1.0.0', 'b@2.0.0']);
  });

  it('keeps the entry of the first mapping for a package version present in several mappings', () => {
    const fromApp = license('a', '1.0.0', {
      description: 'from the app',
      dependencyType: 'transitiveDependency',
      requiredVersion: '^1.0.0',
    });
    const fromAdditionalRoot = license('a', '1.0.0', { description: 'from the additional root' });

    const merged = mergeLicensesMappings({ 'a@1.0.0': fromApp }, { 'a@1.0.0': fromAdditionalRoot });

    expect(merged['a@1.0.0']).toEqual(fromApp);
  });

  it('combines parent packages of a package version present in several mappings, without duplicates', () => {
    const parentA = { name: 'parent-a', requiredVersion: '^1.0.0', resolvedVersion: '1.2.0' };
    const parentB = { name: 'parent-b', requiredVersion: '~2.0.0', resolvedVersion: '2.0.1' };

    const merged = mergeLicensesMappings(
      { 'x@1.0.0': license('x', '1.0.0', { parentPackages: [parentA] }) },
      { 'x@1.0.0': license('x', '1.0.0', { parentPackages: [{ ...parentA }, parentB] }) },
    );

    expect(merged['x@1.0.0'].parentPackages).toEqual([parentA, parentB]);
  });

  it('keeps different versions of a package as separate entries', () => {
    const merged = mergeLicensesMappings({ 'x@1.0.0': license('x', '1.0.0') }, { 'x@2.0.0': license('x', '2.0.0') });

    expect(Object.keys(merged)).toEqual(['x@1.0.0', 'x@2.0.0']);
  });

  it('does not modify the mappings passed in, not even through the merged mapping', () => {
    const first = {
      'x@1.0.0': license('x', '1.0.0', {
        parentPackages: [{ name: 'parent-a', requiredVersion: '^1.0.0', resolvedVersion: '1.2.0' }],
      }),
      'y@1.0.0': license('y', '1.0.0', {
        licenseFiles: [{ file: '/y/LICENSE', content: 'MIT License', licenseId: 'MIT' }],
        parentPackages: [{ name: 'parent-a', requiredVersion: '^1.0.0', resolvedVersion: '1.2.0' }],
      }),
    };
    const second = {
      'x@1.0.0': license('x', '1.0.0', {
        parentPackages: [{ name: 'parent-b', requiredVersion: '~2.0.0', resolvedVersion: '2.0.1' }],
      }),
    };
    const snapshots = structuredClone([first, second]);

    mutateEveryObjectAndArray(mergeLicensesMappings(first, second));

    expect([first, second]).toEqual(snapshots);
  });
});
