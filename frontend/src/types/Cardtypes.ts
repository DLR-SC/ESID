// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import { Dictionary } from "util/util";

export interface Scenario {
  id: number;
  label: string;
}

export const initialState = {
  scenarios: [] as Scenario[],
  compartments: [] as string[],
};

export interface cardValue {
  compartmentValues: Dictionary<number> | null;
  startValues: Dictionary<number> | null;
}

export interface filterValue {
  filteredTitle: string;
  filteredValues: Dictionary<number> | null;
}
