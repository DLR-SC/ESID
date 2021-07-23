import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import i18n from '../util/i18n';

/**
 * AGS is the abbreviation for "Amtlicher Gemeindeschlüssel" in German, which are IDs of areas in Germany. The AGS have
 * a structure to them that describes a hierarchy from a state level to a district level (and even smaller). Since we
 * are only interested in districts, our AGS are always of length 5. We dedicate the AGS of '00000' to the whole of
 * Germany, in case no AGS is selected.
 */
export type AGS = string;

export interface DataSelection {
  district: {ags: AGS; name: string; type: string};
  date: number;
  scenario: string;
  compartment: string;
}

const initialState: DataSelection = {
  district: {ags: '00000', name: i18n.t('germany'), type: ''},
  date: new Date(2021, 0).getTime(),
  scenario: 'default',
  compartment: 'infected',
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
    selectDate(state, action: PayloadAction<number | Date>) {
      state.date = typeof action.payload === 'number' ? action.payload : action.payload.getTime();
    },
    selectScenario(state, action: PayloadAction<string>) {
      state.scenario = action.payload;
    },
    selectCompartment(state, action: PayloadAction<string>) {
      state.compartment = action.payload;
    },
  },
});

export const {selectDistrict, selectDate, selectScenario, selectCompartment} = DataSelectionSlice.actions;
export default DataSelectionSlice.reducer;