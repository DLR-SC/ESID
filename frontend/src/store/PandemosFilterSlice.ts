// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export interface PandemosFilter {
  tripDurationMin?: number;
  tripDurationMax?: number;
  ageGroups?: number[];
  transportationModes?: number[];
  activities?: number[];
  originTypes?: number[];
  destinationTypes?: number[];
  infectionStates?: number[];
}

const initialState: PandemosFilter = {};

/**
 * This slice manages and stores all filters & selections for the pandemos section.
 */
export const PandemosFilterSlice = createSlice({
  name: 'PandemosFilter',
  initialState,
  reducers: {
    /**
     * Set selected trip duration (or range).
     * No parameters to reset selection.
     */
    selectTripDuration(state, action: PayloadAction<{start?: number; end?: number}>) {
      state.tripDurationMin = action.payload.start;
      state.tripDurationMax = action.payload.end ?? action.payload.start;
    },
    /**
     * Set selected age group(s).
     * Accepts single number or a list of numbers.
     * No parameter to reset selection.
     */
    selectAgeGroups(state, action: PayloadAction<{ageGroups?: number | number[]}>) {
      if (action.payload.ageGroups) {
        state.ageGroups = [];
        state.ageGroups = state.ageGroups.concat(action.payload.ageGroups);
      } else {
        // reset filter if parameter is undefined
        state.ageGroups = undefined;
      }
    },
    /**
     * Set selected transportation mode(s).
     * Accepts single number or a list of numbers.
     * No parameter to reset selection.
     */
    selectTransportationModes(state, action: PayloadAction<{transportationModes?: number | number[]}>) {
      if (action.payload.transportationModes) {
        state.transportationModes = [];
        state.transportationModes = state.transportationModes.concat(action.payload.transportationModes);
      } else {
        // reset filter if parameter is undefined
        state.transportationModes = undefined;
      }
    },
    /**
     * Set selected activity(-ies).
     * Accepts single number or a list of numbers.
     * No parameters to reset selection.
     */
    selectActivities(state, action: PayloadAction<{activities?: number | number[]}>) {
      if (action.payload.activities) {
        state.activities = [];
        state.activities = state.activities.concat(action.payload.activities);
      } else {
        // reset filter if parameter is undefined
        state.activities = undefined;
      }
    },
    /**
     * Set selected origin type(s).
     * Accepts single number or a list of numbers.
     * No parameters to reset selection.
     */
    selectOriginTypes(state, action: PayloadAction<{originTypes?: number | number[]}>) {
      if (action.payload.originTypes) {
        state.originTypes = [];
        state.originTypes = state.originTypes.concat(action.payload.originTypes);
      } else {
        // reset filter if parameter is undefined
        state.originTypes = undefined;
      }
    },
    /**
     * Set selected destination type(s).
     * Accepts single number or a list of numbers.
     * No parameters to reset selection.
     */
    selectDestinationTypes(state, action: PayloadAction<{destinationTypes?: number | number[]}>) {
      if (action.payload.destinationTypes) {
        state.destinationTypes = [];
        state.destinationTypes = state.destinationTypes.concat(action.payload.destinationTypes);
      } else {
        // reset filter if parameter is undefined
        state.destinationTypes = undefined;
      }
    },
    /**
     * Set selected infection state(s).
     * Accepts single number or a list of numbers.
     * No parameters to reset selection.
     */
    selectInfectionStates(state, action: PayloadAction<{infectionStates?: number | number[]}>) {
      if (action.payload.infectionStates) {
        state.infectionStates = [];
        state.infectionStates = state.infectionStates.concat(action.payload.infectionStates);
      } else {
        // reset filter if parameter is undefined
        state.infectionStates = undefined;
      }
    },
  },
});

export const {
  selectTripDuration,
  selectAgeGroups,
  selectTransportationModes,
  selectActivities,
  selectOriginTypes,
  selectDestinationTypes,
  selectInfectionStates,
} = PandemosFilterSlice.actions;
export default PandemosFilterSlice.reducer;
