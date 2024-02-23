// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export interface Scenario {
  id: number;
  label: string;
}

const initialState = {
  scenarios: {} as {[key: number]: Scenario},
  compartments: [] as Array<string>,
};

/**
 * This slice manages the list of Scenarios.
 */
export const ScenarioSlice = createSlice({
  name: 'Scenario',
  initialState,
  reducers: {
    setScenarios(state, action: PayloadAction<Array<Scenario>>) {
      const scenarioDict: {[key: number]: Scenario} = {};
      action.payload.forEach((value) => (scenarioDict[value.id] = value));
      state.scenarios = scenarioDict;
    },
    setCompartments(state, action: PayloadAction<Array<string>>) {
      state.compartments = sortWithPreference([...action.payload]);
    },
  },
});

export const {setScenarios, setCompartments} = ScenarioSlice.actions;
export default ScenarioSlice.reducer;

const preferredOrder = [
  'MildInfections',
  'Infected',
  'Hospitalized',
  'ICU',
  'Dead',
  'Exposed',
  'Recovered',
  'Carrier',
  'Susceptible',
];

/** This function sorts an array with the first elements being the above preference if they are included in the array. */
function sortWithPreference(array: Array<string>): Array<string> {
  const result = preferredOrder.filter((entry) => array.includes(entry));
  array = array.filter((entry) => !preferredOrder.includes(entry));

  return [...result, ...array.sort((a, b) => a.localeCompare(b))];
}
