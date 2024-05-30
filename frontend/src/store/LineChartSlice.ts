import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface LineChartState {
  selectedDate: string;
  referenceDate: number | null;
}
const initialState: LineChartState = {
  selectedDate: '',
  referenceDate: null,
};

export const LineChartSlice = createSlice({
  name: 'LineChart',
  initialState,
  reducers: {
    setSelectedDateStore: (state, action: PayloadAction<string>) => {
      state.selectedDate = action.payload;
    },
    setReferenceDateStore: (state, action: PayloadAction<number | null>) => {
      state.referenceDate = action.payload;
    },
  },
});

export const {setSelectedDateStore, setReferenceDateStore} = LineChartSlice.actions;
export default LineChartSlice.reducer;
