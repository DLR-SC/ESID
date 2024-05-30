import {createSlice} from '@reduxjs/toolkit';

export interface SelectedDistrict {
  [key: string]: string | number;
}

const initialState: SelectedDistrict = {};

export const SelectedDistrictSlice = createSlice({
  name: 'SelectedDistrict',
  initialState,
  reducers: {
    setSelectedDistrict: (state, action) => {
      state = action.payload as SelectedDistrict;
    },
  },
});

export const {setSelectedDistrict} = SelectedDistrictSlice.actions;
export default SelectedDistrictSlice.reducer;
