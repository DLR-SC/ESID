/**
 * Makes a deep copy of the supplied object.
 * @param obj
 */
export function deepCopy<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj)) as T;
}

export function dateToISOString(date: Date | number): string {
  if (typeof date === 'number') {
    date = new Date(date);
  }

  return date.toISOString().slice(0, 10);
}

/**
 * This is a type that can be used to describe object maps with a clear key/value structure. E.g:
 * const ages: Dictionary<number> = {:
 *   Aragorn: 87,
 *   Arwen: 2901,
 *   Bilbo: 129,
 *   Boromir: 41,
 *   Elrond: 6518,
 *   Frodo: 51,
 *   Galadriel: 7000,
 *   Gimli: 140,
 *   Gollum: 589,
 *   Legolas: 2931,
 *   Merry: 37,
 *   Pippin: 29,
 *   Samwise: 39
 * }
 */
export interface Dictionary<T> {
  [key: string]: T;
}