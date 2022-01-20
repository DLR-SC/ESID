import {useState} from 'react';

export function NumberFormatter(props: NumberFormatterProps): [(value: number) => string] {
  const [largeIntegerNumberFormatter] = useState(new Intl.NumberFormat(props.lang, {maximumFractionDigits: 0}));
  const [smallNumberFormatter] = useState(
    new Intl.NumberFormat(props.lang, {maximumSignificantDigits: props.significantDigits})
  );

  function formatNumber(value: number): string {
    const absValue = Math.abs(value);
    const powSignificant = Math.pow(10, props.significantDigits - 1);

    if (absValue >= powSignificant) {
      return largeIntegerNumberFormatter.format(value);
    }

    const powFractional = Math.pow(10, props.maxFractionalDigits);
    value = Math.round((value + Number.EPSILON) * powFractional) / powFractional;
    return smallNumberFormatter.format(value);
  }

  return [formatNumber];
}

interface NumberFormatterProps {
  lang: string;
  significantDigits: number;
  maxFractionalDigits: number;
}
