import {useEffect, useState} from 'react';

/**
 * This hook can be used to format numbers with language specific formatting and can be configured to display certain
 * amounts of digits.
 *
 * The `significantDigits` property controls how many significant digits should be displayed. It never rounds numbers
 * left of the decimal point only those to the right. For example `significantDigits = 3` would display the following
 * numbers like this:
 * - 1234567,89    => 1234567
 * - 123,456789    => 123
 * - 1,23456789    => 1,23
 * - 0,00123456789 => 0,00123
 *
 * The `maxFractionalDigits` property controls at which number of digits after the decimal point rounding should occur.
 * It overrides the `significantDigits` property. As an example we have `significantDigits = 3` and
 * `maxFractionalDigits = 4`:
 * - 1234567,89      => 1234567
 * - 1,23456789      => 1,23
 * - 0,0123456789    => 0,0123
 * - 0,00123456789   => 0,0012
 * - 0,000123456789  => 0,0001
 * - 0,0000123456789 => 0
 */
export function NumberFormatter(
  lang: string,
  significantDigits: number,
  maxFractionalDigits: number
): {formatNumber: (value: number) => string} {
  const [largeNumberFormatter, setLargeNumberFormatter] = useState(
    new Intl.NumberFormat(lang, {maximumFractionDigits: 0})
  );

  const [smallNumberFormatter, setSmallNumberFormatter] = useState(
    new Intl.NumberFormat(lang, {maximumSignificantDigits: significantDigits})
  );

  useEffect(() => {
    setLargeNumberFormatter(new Intl.NumberFormat(lang, {maximumFractionDigits: 0}));
    setSmallNumberFormatter(new Intl.NumberFormat(lang, {maximumSignificantDigits: significantDigits}));
  }, [lang, significantDigits]);

  function formatNumber(value: number): string {
    const absValue = Math.abs(value);
    const powSignificant = Math.pow(10, significantDigits - 1);

    if (absValue >= powSignificant) {
      return largeNumberFormatter.format(value);
    }

    const powFractional = Math.pow(10, maxFractionalDigits);
    value = Math.round((value + Number.EPSILON) * powFractional) / powFractional;
    return smallNumberFormatter.format(value);
  }

  return {formatNumber};
}
