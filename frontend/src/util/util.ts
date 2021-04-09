/**
 * Makes a deep copy of the supplied object.
 * @param obj
 */
export function deepCopy<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj)) as T;
}
