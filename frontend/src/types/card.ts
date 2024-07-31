// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {Dictionary} from 'util/util';

/**
 * Represents the value of a card.
 */
export interface CardValue {
  /** A dictionary of compartment values associated with the card.*/
  compartmentValues: Dictionary<number> | null;

  /** A dictionary of start values */
  startValues: Dictionary<number> | null;
}

/**
 * Represents the filter value for a card.
 */
export interface FilterValue {
  /** The filter title. */
  filteredTitle: string;

  /** The filtered values. */
  filteredValues: Dictionary<number> | null;
}
