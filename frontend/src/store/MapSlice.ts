import {createSlice} from '@reduxjs/toolkit';

export interface SelectedDistrict {
  [key: string]: string | number;
}

const initialState: SelectedDistrict = {};

export const SelectedDistrictSlice = createSlice({
  name: 'SelectedArea',
  initialState,
  reducers: {
    setSelectedAreaStore: (_state, action) => {
      return action.payload as SelectedDistrict;
    },
  },
});

export const {setSelectedAreaStore} = SelectedDistrictSlice.actions;
export default SelectedDistrictSlice.reducer;
