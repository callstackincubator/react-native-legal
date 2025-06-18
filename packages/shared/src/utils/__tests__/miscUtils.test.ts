import { arrayIncludesObject, compareObjects } from '../miscUtils';

describe('compareObjects', () => {
  it('should return true for equal primitives', () => {
    expect(compareObjects(1, 1)).toBe(true);

    expect(compareObjects('a', 'a')).toBe(true);

    expect(compareObjects(false, false)).toBe(true);

    expect(compareObjects(null, null)).toBe(true);

    expect(compareObjects(undefined, undefined)).toBe(true);
  });

  it('should return false for different primitives', () => {
    expect(compareObjects(1, 2)).toBe(false);

    expect(compareObjects('a', 'b')).toBe(false);

    expect(compareObjects(true, false)).toBe(false);

    expect(compareObjects(null, undefined)).toBe(false);
  });

  it('should return true for deeply equal objects', () => {
    const a = { a: 1, b: { c: 2 } };
    const b = { a: 1, b: { c: 2 } };

    expect(compareObjects(a, b)).toBe(true);
    expect(compareObjects(b, a)).toBe(true);

    expect(compareObjects(a, a)).toBe(true);
    expect(compareObjects(b, b)).toBe(true);
  });

  it('should return false for objects with different keys', () => {
    const a = { a: 1, b: 2 };
    const b = { a: 1, c: 2 };

    expect(compareObjects(a, b)).toBe(false);
    expect(compareObjects(b, a)).toBe(false);
  });

  it('should return false for objects with different values', () => {
    const a = { a: 1, b: 2 };
    const b = { a: 1, b: 3 };

    expect(compareObjects(a, b)).toBe(false);
    expect(compareObjects(b, a)).toBe(false);
  });

  it('should return true for deeply equal arrays', () => {
    expect(compareObjects([1, 2, { a: 3 }], [1, 2, { a: 3 }])).toBe(true);
  });

  it('should return false for arrays with different elements', () => {
    expect(compareObjects([1, 2], [2, 1])).toBe(false);
  });
});

describe('arrayIncludesObject', () => {
  it('should return true if array contains a deeply-equal object', () => {
    const arr = [{ a: 1 }, { b: 2 }];

    expect(arrayIncludesObject(arr, { a: 1 })).toBe(true);
  });

  it('should return true if array includes a deeply-equal, deeply-nested object', () => {
    const arr = [{ a: { b: 2 } }, { c: 3 }];

    expect(arrayIncludesObject(arr, { a: { b: 2 } })).toBe(true);
  });
  it('should return false if array does not contain a deeply-equal object', () => {
    const arr = [{ a: 1 }, { b: 2 }];

    expect(arrayIncludesObject(arr, { c: 3 })).toBe(false);
  });

  it('should return true if array contains an equal primitive value', () => {
    expect(arrayIncludesObject([1, 2, 3], 2)).toBe(true);
  });

  it('should return true if array does not contain an equal primitive value', () => {
    expect(arrayIncludesObject([1, 2, 3], 4)).toBe(false);
  });

  it('should return undefined if array is not an array', () => {
    expect(arrayIncludesObject(undefined as any, { a: 1 })).toBeUndefined();

    expect(arrayIncludesObject(null as any, { a: 1 })).toBeUndefined();

    expect(arrayIncludesObject(123 as any, { a: 1 })).toBeUndefined();
  });
});
