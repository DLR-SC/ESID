// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

/**
 * Makes a deep copy of the supplied object.
 * @param obj
 */
export function deepCopy<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj)) as T;
}

/**
 * Converts the given Date to a string following the ISO-Format YYYY-MM-DD.
 * @param date Either a Date object or milliseconds since the Unix-Epoch.
 * @return The date in the ISO-Format: YYYY-MM-DD
 */
export function dateToISOString(date: Date | number): string {
  if (typeof date === 'number') {
    date = new Date(date);
  }

  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');

  return `${year}-${month}-${day}`;
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
