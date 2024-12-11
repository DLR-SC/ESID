// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {createSlice, PayloadAction} from '@reduxjs/toolkit';

type MapBounds = [[number, number], [number, number]]; //[SW lat, SW long][NE lat, NE long]
type MapCenter = [number, number];

export interface InspireGrid {
  zoom?: number;
  bounds?: MapBounds;
  center?: MapCenter;
}

// Defined from ETRS89.io website for ETRS89
const initialState: InspireGrid = {
  zoom: 14,
  bounds: [
    [52.248, 10.477],
    [52.273, 10.572],
  ],
  center: [52.26, 10.52], //[12.04, 58.81] - Temporarily center Braunschweig
};

export const InspireGridSlice = createSlice({
  name: 'Inspire Grid',
  initialState,
  reducers: {
    setMapZoom(state, action: PayloadAction<number>) {
      state.zoom = action.payload;
    },
    setMapBounds(state, action: PayloadAction<MapBounds>) {
      state.bounds = action.payload;
    },
    setMapCenter(state, action: PayloadAction<MapCenter>) {
      state.center = action.payload;
    },
  },
});

export const {setMapZoom, setMapBounds, setMapCenter} = InspireGridSlice.actions;
export default InspireGridSlice.reducer;
