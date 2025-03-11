// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {HeatmapLegend} from '../types/heatmapLegend';
import {PopulationValueModeType} from 'types/populationValueMode';

export interface UserPreference {
  selectedHeatmap: HeatmapLegend;
  selectedTab?: string;
  isInitialVisit: boolean;
  populationValueMode: PopulationValueModeType;
}

const initialState: UserPreference = {
  // Heatmaps are initialized in the HeatLegendEdit Component
  selectedHeatmap: {
    name: 'uninitialized',
    isNormalized: true,
    steps: [
      {color: 'rgb(255,255,255)', value: 0},
      {color: 'rgb(255,255,255)', value: 1},
    ],
  },
  selectedTab: '1',
  isInitialVisit: true,
  populationValueMode: 'absolute',
};

/**
 * This slice manages all state that has to do with user preferences.
 */
export const UserPreferenceSlice = createSlice({
  name: 'UserPreference',
  initialState,
  reducers: {
    /** Set currently selected HeatmapLegend. */
    selectHeatmapLegend(state, action: PayloadAction<{legend: HeatmapLegend}>) {
      state.selectedHeatmap = action.payload.legend;
    },
    selectTab(state, action: PayloadAction<string>) {
      state.selectedTab = action.payload;
    },
    /** Set users initial visit to the application */
    setInitialVisit(state, action: PayloadAction<boolean>) {
      state.isInitialVisit = action.payload;
    },
    /** User preferred population value mode (absolute or proportional) */
    setPopulationValueMode(state, action: PayloadAction<PopulationValueModeType>) {
      state.populationValueMode = action.payload;
    },
  },
});

export const {selectHeatmapLegend, selectTab, setInitialVisit, setPopulationValueMode} = UserPreferenceSlice.actions;
export default UserPreferenceSlice.reducer;
