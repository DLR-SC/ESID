// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {TourType} from '../types/tours';

export interface UserOnboarding {
  tours: Record<TourType, boolean | null>;
  showTooltip: boolean;
}

const initialState: UserOnboarding = {
  tours: {
    districtMap: null,
    scenario: null,
    lineChart: null,
    filter: null,
  },
  showTooltip: false,
};

/**
 * This slice is used to determine if the user has completed a tour or not, therefore determine if they are a first time visitor,
 * and to show the tooltip over the information button in the top-bar.
 */
export const userOnboardingSlice = createSlice({
  name: 'UserOnboarding',
  initialState,
  reducers: {
    setTourCompleted(state, action: PayloadAction<{tour: TourType; completed: boolean}>) {
      state.tours[action.payload.tour] = action.payload.completed;
    },
    setShowTooltip(state, action: PayloadAction<boolean>) {
      state.showTooltip = action.payload;
    },
  },
});

export const {setTourCompleted, setShowTooltip} = userOnboardingSlice.actions;

export default userOnboardingSlice.reducer;
