/**
 * Ensures that input is a plain, string-indexed `Record` object
 * @see {@link https://stackoverflow.com/a/74743075}
 * @since 1.0.0
 */
export function isStringRecord<T>(obj: unknown): obj is Record<string, T> {
  if (typeof obj !== 'object') {
    return false;
  }

  if (obj === null || Array.isArray(obj)) {
    return false;
  }

  if (Object.getOwnPropertySymbols(obj).length > 0) {
    return false;
  }

  return true;
}
