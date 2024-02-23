// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {describe, test, expect} from 'vitest';

import {dateToISOString} from '../../util/util';
import * as util from '../../util/util';

describe('deepCopy', () => {
  test('object', () => {
    const object = {a: 0, b: 'test'};
    const copiedObject = util.deepCopy(object);

    expect(copiedObject).toStrictEqual(object);
    expect(copiedObject).not.toBe(object);
  });

  test('array', () => {
    const array = [0, 1, 2];
    const copiedArray = util.deepCopy(array);

    expect(copiedArray).toStrictEqual(array);
    expect(copiedArray).not.toBe(array);
  });

  test('compound', () => {
    const object = {a: 0, b: [1, 2, 3], c: {d: 'test'}};
    const copiedObject = util.deepCopy(object);

    expect(copiedObject).toStrictEqual(object);
    expect(copiedObject).not.toBe(object);
  });
});

describe('dateToISOString', () => {
  test('Date', () => {
    const date = new Date(2021, 1, 5);
    const result = dateToISOString(date);

    expect(result).toBe('2021-02-05');
  });

  test('Epoch Millis', () => {
    const millis = new Date(2021, 1, 5).getTime();
    const result = dateToISOString(millis);

    expect(result).toBe('2021-02-05');
  });
});
