import {createSlice, PayloadAction} from '@reduxjs/toolkit';

import {Dictionary} from '../util/util';

import {CompartmentFilter} from 'types/compartment';

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
export interface DataSelectionFilter {
  filter: string[] | null;
  compartmentFilters: Dictionary<CompartmentFilter> | null;
}

const initialState: DataSelectionFilter = {
  filter: null,
  compartmentFilters: {},
};

/**
 * This slice manages all state that is selecting data.
 */
export const DataSelectionSliceFilter = createSlice({
  name: 'DataSelection',
  initialState,
  reducers: {
    setCompartmentFilter(state, action: PayloadAction<CompartmentFilter>) {
      if (!state.compartmentFilters) {
        state.compartmentFilters = {};
      }

      state.compartmentFilters[action.payload.id] = action.payload;
    },

    deletecompartmentFilter(state, action: PayloadAction<string>) {
      if (!state.compartmentFilters) {
        state.compartmentFilters = {};
      }

      delete state.compartmentFilters[action.payload];
    },

    togglecompartmentFilter(state, action: PayloadAction<string>) {
      if (!state.compartmentFilters) {
        state.compartmentFilters = {};
      }

      if (state.compartmentFilters[action.payload]) {
        state.compartmentFilters[action.payload].isVisible = !state.compartmentFilters[action.payload].isVisible;
      }
    },
  },
});

export const {
  setCompartmentFilter,

  deletecompartmentFilter,

  togglecompartmentFilter,
} = DataSelectionSliceFilter.actions;

export default DataSelectionSliceFilter.reducer;
