// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

export const latitudeSpacing: {[key: number]: number} = {
  0: 3600,
  1: 3000,
  2: 1800,
  3: 1200,
  4: 600,
  5: 300,
  6: 120,
  7: 60,
  8: 30,
  9: 15,
  10: 5,
  11: 3,
  12: 1.5,
  13: 1,
  14: 0.75,
  15: 0.5,
  16: 0.3,
  17: 0.15,
  18: 0.1,
  19: 0.075,
  20: 0.03,
  21: 0.015,
  22: 0.01,
  23: 0.0075,
  24: 0.003,
};

export const cellSize: {[key: number]: {value: number; unit: string}} = {
  0: {value: 1, unit: 'D'},
  1: {value: 50, unit: 'M'},
  2: {value: 30, unit: 'M'},
  3: {value: 20, unit: 'M'},
  4: {value: 10, unit: 'M'},
  5: {value: 5, unit: 'M'},
  6: {value: 2, unit: 'M'},
  7: {value: 1, unit: 'M'},
  8: {value: 30, unit: 'S'},
  9: {value: 15, unit: 'S'},
  10: {value: 5, unit: 'S'},
  11: {value: 3, unit: 'S'},
  12: {value: 1500, unit: 'MS'},
  13: {value: 1000, unit: 'MS'},
  14: {value: 750, unit: 'MS'},
  15: {value: 500, unit: 'MS'},
  16: {value: 300, unit: 'MS'},
  17: {value: 150, unit: 'MS'},
  18: {value: 100, unit: 'MS'},
  19: {value: 75, unit: 'MS'},
  20: {value: 30, unit: 'MS'},
  21: {value: 15, unit: 'MS'},
  22: {value: 10, unit: 'MS'},
  23: {value: 7500, unit: 'MMS'},
  24: {value: 3000, unit: 'MMS'},
};

export const factorPerZone: {[key: number]: number} = {
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 6,
};

export const ETRS89Boundaries: [[number, number], [number, number]] = [
  [32.88, -16.1],
  [84.73, 40.18],
];
