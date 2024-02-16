// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {dateToISOString, Dictionary} from '../util/util';
import {GroupFilter} from 'types/group';

/**
 * AGS is the abbreviation for "Amtlicher Gemeindeschlüssel" in German, which are IDs of areas in Germany. The AGS have
 * a structure to them that describes a hierarchy from a state level to a district level (and even smaller). Since we
 * are only interested in districts, our AGS are always of length 5. We dedicate the AGS of '00000' to the whole of
 * Germany, in case no AGS is selected.
 */
export type AGS = string;

/**
 * This contains all the state, that the user can configure directly.
 *
 * IMPORTANT: ALL NEW ADDITIONS MUST BE NULLABLE TO ENSURE EXISTING CACHES DOESN'T BREAK ON UPDATES!
 */
export interface DataSelection {
  district: {ags: AGS; name: string; type: string};
  /** The current date in the store. Must be an ISO 8601 date cutoff at time (YYYY-MM-DD) */
  date: string | null;
  scenario: number | null;
  compartment: string | null;
  compartmentsExpanded: boolean | null;
  activeScenarios: number[] | null;

  simulationStart: string | null;
  minDate: string | null;
  maxDate: string | null;
  groupFilters: Dictionary<GroupFilter> | null;
}

const initialState: DataSelection = {
  district: {ags: '00000', name: '', type: ''},
  date: null,
  scenario: null,
  compartment: null,
  compartmentsExpanded: null,
  activeScenarios: [0],

  simulationStart: null,
  minDate: null,
  maxDate: null,
  groupFilters: {},
};

/**
 * This slice manages all state that is selecting data.
 */
export const DataSelectionSlice = createSlice({
  name: 'DataSelection',
  initialState,
  reducers: {
    selectDistrict(state, action: PayloadAction<{ags: AGS; name: string; type: string}>) {
      state.district = action.payload;
    },
    selectDate(state, action: PayloadAction<string>) {
      const newDate = action.payload;
      if (state.maxDate && newDate > state.maxDate) {
        state.date = state.maxDate;
      } else if (state.minDate && newDate < state.minDate) {
        state.date = state.minDate;
      } else {
        state.date = action.payload;
      }
    },
    previousDay(state) {
      if (state.date && state.date !== state.minDate) {
        const date = new Date(state.date);
        date.setUTCDate(date.getUTCDate() - 1);
        state.date = dateToISOString(date);
      }
    },
    nextDay(state) {
      if (state.date && state.date !== state.maxDate) {
        const date = new Date(state.date);
        date.setUTCDate(date.getUTCDate() + 1);
        state.date = dateToISOString(date);
      }
    },
    setStartDate(state, action: PayloadAction<string>) {
      state.simulationStart = action.payload;
    },
    setMinMaxDates(state, action: PayloadAction<{minDate: string; maxDate: string}>) {
      state.minDate = action.payload.minDate;
      state.maxDate = action.payload.maxDate;
      if (!state.date || state.date > state.maxDate) {
        state.date = state.maxDate;
      } else if (!state.date || state.date < state.minDate) {
        state.date = state.minDate;
      }
    },
    selectScenario(state, action: PayloadAction<number | null>) {
      state.scenario = action.payload;
    },
    toggleScenario(state, action: PayloadAction<number>) {
      if (!state.activeScenarios) {
        state.activeScenarios = [0];
      }
      const index = state.activeScenarios.indexOf(action.payload);
      if (index == -1) {
        state.activeScenarios.push(action.payload);
      } else {
        state.activeScenarios.splice(index, 1);
      }
    },
    selectCompartment(state, action: PayloadAction<string>) {
      state.compartment = action.payload;
    },
    toggleCompartmentExpansion(state) {
      state.compartmentsExpanded = !state.compartmentsExpanded;
    },
    setGroupFilter(state, action: PayloadAction<GroupFilter>) {
      if (!state.groupFilters) {
        state.groupFilters = {};
      }

      state.groupFilters[action.payload.id] = action.payload;
    },
    deleteGroupFilter(state, action: PayloadAction<string>) {
      if (!state.groupFilters) {
        state.groupFilters = {};
      }

      delete state.groupFilters[action.payload];
    },
    toggleGroupFilter(state, action: PayloadAction<string>) {
      if (!state.groupFilters) {
        state.groupFilters = {};
      }

      if (state.groupFilters[action.payload]) {
        state.groupFilters[action.payload].isVisible = !state.groupFilters[action.payload].isVisible;
      }
    },
  },
});

export const {
  selectDistrict,
  selectDate,
  previousDay,
  nextDay,
  setStartDate,
  setMinMaxDates,
  selectScenario,
  selectCompartment,
  toggleCompartmentExpansion,
  setGroupFilter,
  deleteGroupFilter,
  toggleGroupFilter,
  toggleScenario,
} = DataSelectionSlice.actions;

export default DataSelectionSlice.reducer;
