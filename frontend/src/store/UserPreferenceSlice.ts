import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {HeatmapLegend} from "../types/heatmapLegend";


export interface UserPreference {
  selectedHeatmap: HeatmapLegend;
  heatmaps: HeatmapLegend[];
}

const initialState: UserPreference = {
  selectedHeatmap: {
    name: "error",
    isNormalized: true,
    steps: [
      {color: "rgb(255,255,255)", value: 0},
      {color: "rgb(255,255,255)", value: 1}
    ]
  },
  heatmaps: []
}


/**
 * This slice manages all state that has to do with user preferences.
 */
export const UserPreferenceSlice = createSlice({
  name: 'UserPreference',
  initialState,
  reducers: {
    selectHeatmapLegend(state, action: PayloadAction<{ legend: HeatmapLegend }>) {
      state.selectedHeatmap = action.payload.legend;
    },
    setHeatmapLegends(state, action: PayloadAction<{ legends: HeatmapLegend[] }>) {
      state.heatmaps = action.payload.legends;
    },

  },
});

export const {selectHeatmapLegend, setHeatmapLegends} = UserPreferenceSlice.actions;
export default UserPreferenceSlice.reducer;
