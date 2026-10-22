import type { AggregatedLicensesMapping, License } from '../../types';
import { LicenseCategory } from '../LicenseCategory';
import { analyzeLicenses } from '../licenseAnalysis';
import { parseLicenseExpression } from '../licenseExpression';

const makeLicense = (name: string, rawLicense: string | null): License => ({
  name,
  version: '1.0.0',
  requiredVersion: '^1.0.0',
  dependencyType: 'dependency',
  parentPackages: [],
  rawLicense,
  license: parseLicenseExpression(rawLicense),
  licenseIds: [],
  licenseFiles: [],
});

const makeReport = (entries: [name: string, rawLicense: string | null][]): AggregatedLicensesMapping =>
  Object.fromEntries(entries.map(([name, rawLicense]) => [`${name}@1.0.0`, makeLicense(name, rawLicense)]));

const REPORT = makeReport([
  ['a', 'MIT'],
  ['b', 'MIT'],
  ['c', 'MIT OR Apache-2.0'],
  // the same expression written with redundant parentheses is grouped under one key
  ['d', '(MIT OR Apache-2.0)'],
  ['e', 'MIT OR GPL-3.0-only'],
  ['f', 'MIT AND LGPL-2.1-only'],
  ['g', null],
]);

describe('analyzeLicenses', () => {
  it('when licenses are analyzed, then byLicense is keyed by the rendered License Expression', () => {
    expect(analyzeLicenses(REPORT, 'most-restrictive').byLicense).toEqual({
      MIT: 2,
      'MIT OR Apache-2.0': 2,
      'MIT OR GPL-3.0-only': 1,
      'MIT AND LGPL-2.1-only': 1,
      unknown: 1,
    });
  });

  it('when licenses are analyzed, then byLicense and byCategory counts add up to total', () => {
    const { byLicense, byCategory, total } = analyzeLicenses(REPORT, 'most-restrictive');
    const sum = (counts: Record<string, number>) => Object.values(counts).reduce((a, b) => a + b, 0);

    expect(total).toBe(7);
    expect(sum(byLicense)).toBe(total);
    expect(sum(byCategory)).toBe(total);
  });

  it.each([
    [
      'most-restrictive',
      {
        [LicenseCategory.PERMISSIVE]: 4,
        [LicenseCategory.WEAK_COPYLEFT]: 1,
        [LicenseCategory.STRONG_COPYLEFT]: 1,
        [LicenseCategory.UNKNOWN]: 1,
      },
      LicenseCategory.STRONG_COPYLEFT,
    ],
    [
      'least-restrictive',
      {
        [LicenseCategory.PERMISSIVE]: 5,
        [LicenseCategory.WEAK_COPYLEFT]: 1,
        [LicenseCategory.STRONG_COPYLEFT]: 0,
        [LicenseCategory.UNKNOWN]: 1,
      },
      LicenseCategory.PERMISSIVE,
    ],
  ] as const)(
    'when OR Policy is %s, then packages are categorized by their License Expression',
    (orPolicy, expectedByCategory, expectedDualLicenseCategory) => {
      const { byCategory, categoryByLicense } = analyzeLicenses(REPORT, orPolicy);

      expect(byCategory).toEqual(expectedByCategory);
      expect(categoryByLicense).toEqual({
        MIT: LicenseCategory.PERMISSIVE,
        'MIT OR Apache-2.0': LicenseCategory.PERMISSIVE,
        'MIT OR GPL-3.0-only': expectedDualLicenseCategory,
        'MIT AND LGPL-2.1-only': LicenseCategory.WEAK_COPYLEFT,
        unknown: LicenseCategory.UNKNOWN,
      });
    },
  );

  it.each([
    ['most-restrictive', LicenseCategory.STRONG_COPYLEFT],
    ['least-restrictive', LicenseCategory.PERMISSIVE],
  ] as const)(
    'when OR Policy is %s, then a package with an OR License Expression gets the category chosen by the policy',
    (orPolicy, expectedCategory) => {
      expect(analyzeLicenses(REPORT, orPolicy).categorizedLicenses['e@1.0.0']).toBe(expectedCategory);
    },
  );

  it('when licenses are analyzed, then categorizedLicenses is keyed by package key', () => {
    expect(analyzeLicenses(REPORT, 'most-restrictive').categorizedLicenses).toEqual({
      'a@1.0.0': LicenseCategory.PERMISSIVE,
      'b@1.0.0': LicenseCategory.PERMISSIVE,
      'c@1.0.0': LicenseCategory.PERMISSIVE,
      'd@1.0.0': LicenseCategory.PERMISSIVE,
      'e@1.0.0': LicenseCategory.STRONG_COPYLEFT,
      'f@1.0.0': LicenseCategory.WEAK_COPYLEFT,
      'g@1.0.0': LicenseCategory.UNKNOWN,
    });
  });
});
