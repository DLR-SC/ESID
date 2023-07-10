/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {HeatmapLegend} from 'types/heatmapLegend';

export interface UserPreference {
  selectedHeatmap: HeatmapLegend;

  //all selectable HeatmapLegends
  heatmaps: HeatmapLegend[];

  //the default HeatmapLegends for each Scenario
  //the defaultHeatmap of the currently selected Scenario is always at index 0 in the "heatmaps" array
  defaultHeatmaps: HeatmapLegend[];
}

const initialState: UserPreference = {
  //Heatmaps are initialized in the HeatLegendEdit Component
  selectedHeatmap: {
    name: 'uninitialized',
    isNormalized: true,
    steps: [
      {color: 'rgb(255,255,255)', value: 0},
      {color: 'rgb(255,255,255)', value: 1},
    ],
  },
  heatmaps: [],
  defaultHeatmaps: [],
};

/**
 * This slice manages all state that has to do with user preferences.
 */
export const UserPreferenceSlice = createSlice({
  name: 'UserPreference',
  initialState,
  reducers: {
    //set currently selected HeatmapLegend
    selectHeatmapLegend(state, action: PayloadAction<{legend: HeatmapLegend}>) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      state.selectedHeatmap = action.payload.legend;
    },
    //set List off all HeatmapLegends
    setHeatmapLegends(state, action: PayloadAction<{legends: HeatmapLegend[]}>) {
      state.heatmaps = action.payload.legends;
    },
    //select the right colored (according to selected Scenario) default HeatmapLegend
    selectDefaultLegend(state, action: PayloadAction<{selectedScenario: number}>) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      state.heatmaps[0] = state.defaultHeatmaps[action.payload.selectedScenario];
      if (state.selectedHeatmap.name == 'Default') {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        state.selectedHeatmap = state.heatmaps[0];
      }
    },
    //set List of all default HeatmapLegend
    setDefaultLegends(state, action: PayloadAction<{legends: HeatmapLegend[]}>) {
      state.defaultHeatmaps = action.payload.legends;
    },
  },
});

export const {selectHeatmapLegend, setHeatmapLegends, selectDefaultLegend, setDefaultLegends} =
  UserPreferenceSlice.actions;
export default UserPreferenceSlice.reducer;