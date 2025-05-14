// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

/**
 * Represents the value of a card.
 */
export interface CardValues {
  /** A dictionary of compartment values associated with the card.*/
  compartmentValues: Record<string, number>;

  /** A dictionary of start values */
  startValues: Record<string, number>;
}

/**
 * Represents the filter value for a card.
 */
export interface FilterValues {
  /** The filter title. */
  filteredTitle: string;

  /** The filtered values. */
  filteredValues: Record<string, number>;
}
