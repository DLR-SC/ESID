// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: CC0-1.0

import {District} from './district';

/**
 * Represents the horizontal threshold for a specific district and compartment.
 */
export interface HorizontalThreshold {
  /** The district for which the threshold applies (AGS). */
  district: District;

  /** The compartment for which the threshold applies. */
  compartment: string;

  /** The actual threshold value for the Y-axis. */
  threshold: number;
}
