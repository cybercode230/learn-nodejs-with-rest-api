/**
 * Removes all properties with 'undefined' values from an object.
 * This is useful when 'exactOptionalPropertyTypes' is enabled in tsconfig.
 */
export function cleanObject<T extends object>(obj: T): T {
  const result = { ...obj };
  Object.keys(result).forEach((key) => {
    if (result[key as keyof T] === undefined) {
      delete result[key as keyof T];
    }
  });
  return result;
}
