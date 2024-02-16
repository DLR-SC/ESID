// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {describe, test, expect} from 'vitest';
import {renderHook} from '@testing-library/react';

import {NumberFormatter} from '../../util/hooks';

describe('NumberFormatter', () => {
  test('languages', () => {
    let lang = 'de';
    const {result, rerender} = renderHook(() => NumberFormatter(lang, 5, 2));

    const germanFormat = result.current.formatNumber(2000.1);
    expect(germanFormat).toBe('2.000,1');

    lang = 'en';
    rerender();

    const englishFormat = result.current.formatNumber(2000.1);
    expect(englishFormat).toBe('2,000.1');
  });

  test('significantDigits', () => {
    const {result} = renderHook(() => NumberFormatter('en', 5, 5));
    const formatNumber = result.current.formatNumber;

    expect(formatNumber(123456)).toBe('123,456');
    expect(formatNumber(12345.6)).toBe('12,346');
    expect(formatNumber(1234.56)).toBe('1,234.6');
    expect(formatNumber(123.456)).toBe('123.46');
    expect(formatNumber(12.3456)).toBe('12.346');
    expect(formatNumber(1.23456)).toBe('1.2346');
    expect(formatNumber(0.123456)).toBe('0.12346');
  });

  test('maxFractionalDigits', () => {
    const {result} = renderHook(() => NumberFormatter('en', 5, 2));
    const formatNumber = result.current.formatNumber;

    expect(formatNumber(123456)).toBe('123,456');
    expect(formatNumber(12345.6)).toBe('12,346');
    expect(formatNumber(1234.56)).toBe('1,234.6');
    expect(formatNumber(123.456)).toBe('123.46');
    expect(formatNumber(12.3456)).toBe('12.35');
    expect(formatNumber(1.23456)).toBe('1.23');
    expect(formatNumber(0.123456)).toBe('0.12');
  });
});
