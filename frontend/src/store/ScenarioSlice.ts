import {createSlice} from '@reduxjs/toolkit';

export interface Scenario {
  id: string;
  label: string;
  color: string;
}

const initialState: {[key: string]: Scenario} = {
  basic: {
    id: 'basic',
    label: 'Basic Contact',
    color: '#3998DB',
  },
  medium: {
    id: 'medium',
    label: 'Leichter Kontakt an Weihnachten',
    color: '#876BE3',
  },
  big: {
    id: 'big',
    label: 'Big Contact',
    color: '#CC5AC7',
  },
  maximum: {
    id: 'maximum',
    label: 'Maximum Contact',
    color: '#EBA73B',
  },
};

/**
 * This slice manages the list of Scenarios.
 */
export const ScenarioSlice = createSlice({
  name: 'Scenario',
  initialState,
  reducers: {},
});

//export const {} = ScenarioSlice.actions;
export default ScenarioSlice.reducer;
