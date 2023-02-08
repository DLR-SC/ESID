import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import i18n from '../util/i18n';
import {dateToISOString, Dictionary} from '../util/util';
import {GroupFilter} from 'types/group';

/**
 * AGS is the abbreviation for "Amtlicher Gemeindeschlüssel" in German, which are IDs of areas in Germany. The AGS have
 * a structure to them that describes a hierarchy from a state level to a district level (and even smaller). Since we
 * are only interested in districts, our AGS are always of length 5. We dedicate the AGS of '00000' to the whole of
 * Germany, in case no AGS is selected.
 */
export type AGS = string;

export interface DataSelection {
  district: {ags: AGS; name: string; type: string};
  date: string | null;
  scenario: number | null;
  compartment: string | null;
  activeScenarios: number[] | null;

  minDate: string | null;
  maxDate: string | null;
  groupFilters: Dictionary<GroupFilter>;
}

const initialState: DataSelection = {
  district: {ags: '00000', name: i18n.t('germany'), type: ''},
  date: null,
  scenario: null,
  compartment: null,
  activeScenarios: null,

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
        state.activeScenarios = [];
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
    addGroupFilter(state, action: PayloadAction<GroupFilter>) {
      state.groupFilters[action.payload.id] = action.payload;
    },
    deleteGroupFilter(state, action: PayloadAction<string>) {
      delete state.groupFilters[action.payload];
    },
    toggleGroupFilter(state, action: PayloadAction<string>) {
      if (state.groupFilters[action.payload]) {
        state.groupFilters[action.payload].toggle = !state.groupFilters[action.payload].toggle;
      }
    },
    setGroupFilterName(state, action: PayloadAction<{id: string; name: string}>) {
      if (state.groupFilters[action.payload.id]) {
        state.groupFilters[action.payload.id].name = action.payload.name;
      }
    },
    setGroupFilters(state, action: PayloadAction<{id: string; groups: Dictionary<string[]>}>) {
      if (state.groupFilters[action.payload.id]) {
        state.groupFilters[action.payload.id].groups = action.payload.groups;
      }
    },
  },
});

export const {
  selectDistrict,
  selectDate,
  previousDay,
  nextDay,
  setMinMaxDates,
  selectScenario,
  selectCompartment,
  addGroupFilter,
  deleteGroupFilter,
  toggleGroupFilter,
  setGroupFilterName,
  setGroupFilters,
  toggleScenario,
} = DataSelectionSlice.actions;
export default DataSelectionSlice.reducer;
