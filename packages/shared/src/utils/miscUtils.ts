import crypto from 'crypto';

export function sha512(text: string) {
  return crypto.createHash('sha512').update(text).digest('hex');
}

export function compareObjects(a: unknown, b: unknown): boolean {
  if (a == null || b == null || typeof a !== 'object' || typeof b !== 'object') {
    return a === b;
  }

  const entriesA = Object.entries(a);
  const entriesB = Object.entries(b);

  return (
    entriesA.length === entriesB.length &&
    entriesA
      .map(([keyA, valueA]) => {
        const entry = entriesB.find(([keyB]) => keyA === keyB);

        if (!entry) {
          return valueA === entry;
        }

        const [, valueB] = entry;

        return compareObjects(valueA, valueB);
      })
      .reduce((acc, curr) => acc && curr, true)
  );
}

/**
 * Makes a deep-check between array items and provided object, returns true if array has provided object.
 */
export function arrayIncludesObject(array?: unknown[], object?: unknown) {
  return array?.map((item) => compareObjects(item, object)).reduce((acc, curr) => acc || curr, false);
}
