import { Dictionary } from 'util/util';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import i18n from '../util/i18n';
import { dateToISOString } from '../util/util';
import { groupData, groupDataSelection } from 'types/group';

/**
 * AGS is the abbreviation for "Amtlicher Gemeindeschlüssel" in German, which are IDs of areas in Germany. The AGS have
 * a structure to them that describes a hierarchy from a state level to a district level (and even smaller). Since we
 * are only interested in districts, our AGS are always of length 5. We dedicate the AGS of '00000' to the whole of
 * Germany, in case no AGS is selected.
 */
export type AGS = string;

export interface filter {
  name: string | null;
  toggle: boolean | null;
  groups: Dictionary<string[]>;
}

export interface DataSelection {
  district: { ags: AGS; name: string; type: string };
  date: string | null;
  scenario: number | null;
  compartment: string | null;
  activeScenarios: number[];

  minDate: string | null;
  maxDate: string | null;
  filter: Array<filter> | null;
  filterData: Dictionary<groupData[]> | null;
}

const initialState: DataSelection = {
  district: { ags: '00000', name: i18n.t('germany'), type: '' },
  date: null,
  scenario: null,
  compartment: null,
  activeScenarios: [],
  minDate: null,
  maxDate: null,
  filter: null,
  filterData: null,
};

/**
 * This slice manages all state that is selecting data.
 */
export const DataSelectionSlice = createSlice({
  name: 'DataSelection',
  initialState,
  reducers: {
    selectDistrict(state, action: PayloadAction<{ ags: AGS; name: string; type: string }>) {
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
    setMinMaxDates(state, action: PayloadAction<{ minDate: string; maxDate: string }>) {
      state.minDate = action.payload.minDate;
      state.maxDate = action.payload.maxDate;
    },
    selectScenario(state, action: PayloadAction<number | null>) {
      state.scenario = action.payload;
    },
    toggleScenario(state, action: PayloadAction<number>) {
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
    addFilter(state, action: PayloadAction<filter>) {
      if (state.filter) {
        state.filter = state.filter.concat(action.payload);
      } else {
        state.filter = new Array<filter>().concat(action.payload);
      }
    },
    deleteFilter(state, action: PayloadAction<string>) {
      if (state.filter) {
        for (let i = 0; i < state.filter.length; i++) {
          if (state.filter[i].name == action.payload) {
            state.filter.splice(i, 1);
          }
        }
      }
    },
    toggleFilter(state, action: PayloadAction<string>) {
      if (state.filter) {
        for (let i = 0; i < state.filter.length; i++) {
          if (state.filter[i].name == action.payload) {
            state.filter[i].toggle = !state.filter[i].toggle;
          }
        }
      }
    },
    addFilterData(state, action: PayloadAction<groupDataSelection>) {
      if (state.filterData) {
        state.filterData[action.payload.name] = action.payload.data;
      } else {
        state.filterData = {} as Dictionary<groupData[]>;
        state.filterData[action.payload.name] = action.payload.data;
      }
    },
    deleteFilterData(state, action: PayloadAction<string>) {
      if (state.filterData && state.filterData[action.payload]) {
        delete state.filterData[action.payload];
      }
    }
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
  addFilter,
  deleteFilter,
  toggleFilter,
  toggleScenario,
  addFilterData,
  deleteFilterData,
} = DataSelectionSlice.actions;
export default DataSelectionSlice.reducer;
