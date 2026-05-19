import type { License } from '../../../types';
import { sha512 } from '../miscUtils';
import { parseAuthorField, parseLicenseField, prepareAboutLibrariesLicenseField } from '../packageUtils';

const makeLicense = (overrides: Partial<License>): License =>
  ({
    name: 'pkg',
    version: '1.0.0',
    dependencyType: 'dependency',
    requiredVersion: '1.0.0',
    parentPackages: [],
    ...overrides,
  }) as License;

describe('parseAuthorField', () => {
  it('should return author name when author is an object with name field', () => {
    const json = { author: { name: 'John Doe' } };

    expect(parseAuthorField(json)).toBe('John Doe');
  });

  it('should return author string when author is a string', () => {
    const json = { author: 'John Doe' };

    expect(parseAuthorField(json)).toBe('John Doe');
  });

  it('should return undefined when author is an object without name field', () => {
    const json = { author: {} as any };

    expect(parseAuthorField(json)).toBeUndefined();
  });

  it('should return undefined when author is undefined', () => {
    const json = { author: undefined as any };

    expect(parseAuthorField(json)).toBeUndefined();
  });
});

describe('parseLicenseField', () => {
  it('should return license type when license is an object with type field', () => {
    const json = { license: { type: 'MIT' } };

    expect(parseLicenseField(json)).toBe('MIT');
  });

  it('should return license string when license is a string', () => {
    const json = { license: 'Apache-2.0' };

    expect(parseLicenseField(json)).toBe('Apache-2.0');
  });

  it('should return undefined when license is an object without type field', () => {
    const json = { license: {} as any };

    expect(parseLicenseField(json)).toBeUndefined();
  });

  it('should return undefined when license is undefined', () => {
    const json = { license: undefined as any };

    expect(parseLicenseField(json)).toBeUndefined();
  });
});

describe('prepareAboutLibrariesLicenseField', () => {
  it('returns empty string when license type is missing', () => {
    expect(prepareAboutLibrariesLicenseField(makeLicense({}))).toBe('');
  });

  it('builds <type>_<hash> for plain license types', () => {
    const result = prepareAboutLibrariesLicenseField(makeLicense({ type: 'MIT', content: 'license body' }));

    expect(result).toBe(`MIT_${sha512('license body')}`);
  });

  it('sanitizes "/" so legacy SPDX like "MIT/X11" does not create a subdirectory on disk', () => {
    const result = prepareAboutLibrariesLicenseField(
      makeLicense({ name: 'nub', type: 'MIT/X11', content: 'license body' }),
    );

    expect(result).not.toContain('/');
    expect(result.startsWith('MIT_X11_')).toBe(true);
  });

  it('sanitizes parentheses and spaces in compound SPDX expressions', () => {
    const result = prepareAboutLibrariesLicenseField(
      makeLicense({ type: '(MIT OR Apache-2.0)', content: 'license body' }),
    );

    expect(result).not.toMatch(/[()\s]/);
    expect(result.startsWith('_MIT_OR_Apache-2.0__')).toBe(true);
  });

  it('hashes the sanitized type when content is absent so the prefix matches the hash input', () => {
    const result = prepareAboutLibrariesLicenseField(makeLicense({ type: 'MIT/X11' }));

    expect(result).toBe(`MIT_X11_${sha512('MIT_X11')}`);
  });
});
