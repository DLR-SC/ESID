import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export interface Scenario {
  id: number;
  label: string;
}

const initialState = {
  scenarios: {} as {[key: number]: Scenario},
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
  },
});

export const {setScenarios} = ScenarioSlice.actions;
export default ScenarioSlice.reducer;
