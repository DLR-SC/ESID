
export function getLongitudinalFactorAndZone(lat: number): {factor: number; zone: number} {
  let factor: number = 1;
  let zone: number = 1;
  lat = Math.abs(lat);
  if (lat >= 50 && lat <= 70) {
    factor = 2;
    zone = 2;
  } else if (lat > 70 && lat <= 75) {
    factor = 3;
    zone = 3;
  } else if (lat > 75 && lat <= 80) {
    factor = 4;
    zone = 4;
  } else if (lat > 80 && lat <= 90) {
    factor = 6;
    zone = 5;
  }
  return {factor, zone};
}

/**
 * This function range generates an array of numbers starting from a given start value, stopping before a stop value,
 * and incrementing by a given step value.
 *
 * @param start The starting value of the range.
 * @param stop  The value at which to stop (this value is not included in the returned array).
 * @param step
 */
export function range(start: number, stop: number, step: number): Array<number> {
  return Array.from({length: Math.ceil((stop - start) / step)}, (_, i) => start + i * step);
}

export function degreesToUnit(value: number, unit: string, multiple: number) {
  const unitMultipliers = {
    D: 1,
    M: 60,
    S: 3600,
    MS: 3600000,
    MMS: 3600000000,
  };

  if (unit in unitMultipliers) {
    return (value * (unitMultipliers as any)[unit]) / multiple;
  } else {
    return 0;
  }
}

export function unitToDegrees(minutes: number, unit: string, multiple: number) {
  const unitMultipliers = {
    D: 1,
    M: 1 / 60,
    S: 1 / 3600,
    MS: 1 / 3600000,
    MMS: 1 / 3600000000,
  };

  if (unit in unitMultipliers) {
    return minutes * (unitMultipliers as any)[unit] * multiple;
  }

  return 0;
}