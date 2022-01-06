import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {Dictionary} from 'util/util';

export interface Scenario {
  id: number;
  label: string;
}

const initialState = {
  scenarios: {} as Dictionary<Scenario>,
};

/**
 * This slice manages the list of Scenarios.
 */
export const ScenarioSlice = createSlice({
  name: 'Scenario',
  initialState,
  reducers: {
    setScenarios(state, action: PayloadAction<Array<Scenario>>) {
      const scenarioDict: Dictionary<Scenario> = {};
      action.payload.forEach((value) => (scenarioDict[value.id] = value));
      state.scenarios = scenarioDict;
    },
  },
});

export const {setScenarios} = ScenarioSlice.actions;
export default ScenarioSlice.reducer;
