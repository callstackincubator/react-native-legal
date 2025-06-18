import { toYaml } from '../yamlUtils';

describe('toYaml', () => {
  it('serializes simple objects', () => {
    expect(toYaml({ a: 'test', b: 1, c: true })).toBe(`a: test\nb: 1\nc: true`);
  });

  it('serializes nested objects', () => {
    expect(toYaml({ a: { b: { c: 'd' } } })).toBe(`a:\n  b:\n    c: d`);
  });

  it('serializes arrays of primitives', () => {
    expect(toYaml({ arr: [1, 2, 3] })).toBe(`arr:\n  - 1\n  - 2\n  - 3`);
  });

  it('serializes arrays of objects', () => {
    expect(toYaml({ arr: [{ x: 1 }, { y: 2 }] })).toBe(`arr:\n  - x: 1\n  - y: 2`);
  });

  it('serializes empty objects', () => {
    expect(toYaml({})).toBe('');
  });

  it('serializes empty arrays', () => {
    expect(toYaml([])).toBe('');
  });

  it('serializes null and undefined as empty', () => {
    expect(toYaml(null)).toBe('');
    expect(toYaml(undefined)).toBe('');
  });

  it('quotes strings if needed', () => {
    expect(
      toYaml({
        a: '',
        b: ' true',
        c: 'no',
        d: 'a:bar',
        e: '1.23',
        f: 'null',
        g: 'yes',
        h: '  spaced  ',
      }),
    ).toBe(`a: ''\nb: ' true'\nc: 'no'\nd: a:bar\ne: '1.23'\nf: 'null'\ng: 'yes'\nh: '  spaced  '`);
  });

  it('quotes keys with special characters', () => {
    expect(toYaml({ 'foo@bar': 1, 'foo/bar': 2, foo_bar: 3, 'foo.bar': 4 })).toBe(
      `"foo@bar": 1\n"foo/bar": 2\n"foo_bar": 3\n"foo.bar": 4`,
    );
  });

  it('serializes multiline strings as blocks', () => {
    expect(toYaml({ note: 'line1\nline2\nline3' })).toBe(`note: |\n  line1\n  line2\n  line3`);
  });

  it('handles complex nested structures', () => {
    const obj = {
      a: [{ b: 'c', d: [1, 2, 3] }, { e: { f: 'g\nh' } }],
      i: 'simple',
    };

    expect(toYaml(obj)).toBe(
      `a:\n  - b: c\n    d:\n      - 1\n      - 2\n      - 3\n  - e:\n      f: |\n        g\n        h\ni: simple`,
    );
  });

  it('serializes numbers and booleans', () => {
    expect(toYaml({ n: 123, b: false })).toBe(`n: 123\nb: false`);
  });

  it('skips null/undefined values in properties of objects', () => {
    expect(toYaml({ a: 1, b: null, c: undefined, d: 2 })).toBe(`a: 1\nd: 2`);
  });
});
