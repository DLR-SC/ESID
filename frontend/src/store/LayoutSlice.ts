// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export interface Layout {
  referenceDayXPositions?: {top?: number; bottom?: number};
}

const initialState: Layout = {
  referenceDayXPositions: {top: 0, bottom: 0},
};

/**
 * This slice manages all state that has to do with inter component communication for layouts.
 */
export const LayoutSlice = createSlice({
  name: 'Layout',
  initialState,
  reducers: {
    setReferenceDayTop(state, action: PayloadAction<number>) {
      if (!state.referenceDayXPositions) {
        state.referenceDayXPositions = {};
      }

      state.referenceDayXPositions.top = action.payload;
    },
    setReferenceDayBottom(state, action: PayloadAction<number>) {
      if (!state.referenceDayXPositions) {
        state.referenceDayXPositions = {};
      }

      state.referenceDayXPositions.bottom = action.payload;
    },
  },
});

export const {setReferenceDayTop, setReferenceDayBottom} = LayoutSlice.actions;
export default LayoutSlice.reducer;
