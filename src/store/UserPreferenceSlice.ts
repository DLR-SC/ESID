// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {Threshold} from 'types/threshold';
import {HeatmapLegend} from 'types/heatmapLegend';

export interface UserPreference {
  selectedHeatmap: HeatmapLegend;
  selectedTab?: string;
  isInitialVisit: boolean;
  horizontalYAxisThresholds?: Record<string, Threshold>;
  yAxisMaxValue?: Record<string, number>;
  scenarioColors: Record<string, string[]>;
}

const initialState: UserPreference = {
  // Heatmaps are initialized in the HeatLegendEdit Component
  selectedHeatmap: {
    name: 'Default',
    isNormalized: true,
    steps: [
      {color: 'rgb(255,255,255)', value: 0},
      {color: 'rgb(255,255,255)', value: 1},
    ],
  },
  selectedTab: '1',
  isInitialVisit: true,
  horizontalYAxisThresholds: {},
  yAxisMaxValue: {},
  scenarioColors: {},
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

    /** Set colors for a specific scenario */
    setScenarioColors(state, action: PayloadAction<{scenarioId: string; colors: string[]}>) {
      if (!state.scenarioColors) {
        state.scenarioColors = {};
      }
      state.scenarioColors[action.payload.scenarioId] = action.payload.colors;
    },

    /** Add a horizontal Y-Axis Threshold for a specific district and compartment */
    addHorizontalYAxisThreshold(state, action: PayloadAction<{key: string; threshold: Threshold}>) {
      if (!state.horizontalYAxisThresholds) {
        state.horizontalYAxisThresholds = {};
      }
      state.horizontalYAxisThresholds[action.payload.key] = action.payload.threshold;
    },
    /** Edit a horizontal Y-Axis Threshold for a specific district and compartment */
    updateHorizontalYAxisThreshold(state, action: PayloadAction<{key: string; threshold: Partial<Threshold>}>) {
      if (!state.horizontalYAxisThresholds) {
        state.horizontalYAxisThresholds = {};
      }

      state.horizontalYAxisThresholds[action.payload.key] = {
        ...state.horizontalYAxisThresholds[action.payload.key],
        ...action.payload.threshold,
      };
    },
    /** Remove a horizontal Y-Axis Threshold for a specific district and compartment */
    removeHorizontalYAxisThreshold(state, action: PayloadAction<string>) {
      if (!state.horizontalYAxisThresholds) {
        state.horizontalYAxisThresholds = {};
      }
      delete state.horizontalYAxisThresholds[action.payload];
    },
    /** Set the maximum value for the Y-axis */
    setYAxisMaxValue(state, action: PayloadAction<{key: string; value: number}>) {
      if (!state.yAxisMaxValue) {
        state.yAxisMaxValue = {};
      }
      state.yAxisMaxValue = {
        ...state.yAxisMaxValue,
        [action.payload.key]: action.payload.value,
      };
    },
  },
});

export const {
  selectHeatmapLegend,
  selectTab,
  setInitialVisit,
  addHorizontalYAxisThreshold,
  updateHorizontalYAxisThreshold,
  removeHorizontalYAxisThreshold,
  setScenarioColors,
  setYAxisMaxValue,
} = UserPreferenceSlice.actions;

export default UserPreferenceSlice.reducer;
