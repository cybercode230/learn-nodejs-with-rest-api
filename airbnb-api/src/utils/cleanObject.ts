/**
 * File: cleanObject.ts
 * What it is doing: Provides a utility function to strip undefined values from objects.
 * Responsibility: Iterating through object properties and safely deleting those that are strictly undefined.
 * Outcomes: Returns a cleaned, shallow-cloned object ready for strict database operations (e.g. Prisma inserts/updates) without throwing errors on undefined values.
 */
/**
 * Removes all properties with 'undefined' values from an object.
 * This is useful when 'exactOptionalPropertyTypes' is enabled in tsconfig.
 */
export function cleanObject<T extends object>(obj: T): T {
  // Create a shallow copy of the object to avoid mutating the original
  const result = { ...obj };

  // Iterate over each key in the object
  Object.keys(result).forEach((key) => {
    // Check if the property value is explicitly undefined
    if (result[key as keyof T] === undefined) {
      // Delete the undefined property from the cloned object
      delete result[key as keyof T];
    }
  });

  // Return the cleaned object
  return result;
}

