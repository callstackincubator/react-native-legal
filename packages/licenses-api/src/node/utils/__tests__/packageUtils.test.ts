import { parseAuthorField, parseLicenseField } from '../packageUtils';

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
