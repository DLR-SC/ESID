// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {Scenario} from 'store/ScenarioSlice';
import {Dictionary} from 'util/util';

export const initialState = {
  scenarios: [] as Scenario[],
  compartments: [] as string[],
};

/**
 * Represents the value of a card.
 */
export interface cardValue {
  /** A dictionary of compartment values associated with the card.*/
  compartmentValues: Dictionary<number> | null;

  /** A dictionary of start values */
  startValues: Dictionary<number> | null;
}

/**
 * Represents the filter value for a card.
 */
export interface filterValue {
  /** The filter title. */
  filteredTitle: string;

  /** The filtered values. */
  filteredValues: Dictionary<number> | null;
}
