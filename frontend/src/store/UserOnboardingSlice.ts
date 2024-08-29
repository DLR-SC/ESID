// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {TourType} from '../types/tours';

export interface UserOnboarding {
  tours: Record<TourType, boolean | null>;
  activeTour: TourType | null;
  allToursCompleted?: boolean;
  showTooltip: boolean;
  showWelcomeDialog: boolean;
  showPopover: boolean;
  isFilterDialogOpen?: boolean;
}

const initialState: UserOnboarding = {
  tours: {
    districtMap: null,
    scenario: null,
    lineChart: null,
    filter: null,
    parameters: null,
  },
  activeTour: null,
  allToursCompleted: false,
  showTooltip: false,
  showWelcomeDialog: true,
  showPopover: false,
  isFilterDialogOpen: false,
};

/**
 * This slice manages the state of the user onboarding tours, tooltips, and modals.
 */

export const userOnboardingSlice = createSlice({
  name: 'UserOnboarding',
  initialState,
  reducers: {
    setTourCompleted(state, action: PayloadAction<{tour: TourType; completed: boolean}>) {
      state.tours[action.payload.tour] = action.payload.completed;
      state.allToursCompleted = Object.values(state.tours).every((completed) => completed === true);
    },
    setActiveTour(state, action: PayloadAction<TourType | null>) {
      state.activeTour = action.payload;
    },
    setShowTooltip(state, action: PayloadAction<boolean>) {
      state.showTooltip = action.payload;
    },
    setShowWelcomeDialog(state, action: PayloadAction<boolean>) {
      state.showWelcomeDialog = action.payload;
    },
    setShowPopover(state, action: PayloadAction<boolean>) {
      state.showPopover = action.payload;
    },
    setIsFilterDialogOpen(state, action: PayloadAction<boolean>) {
      state.isFilterDialogOpen = action.payload;
    },
  },
});

export const {
  setTourCompleted,
  setActiveTour,
  setShowTooltip,
  setShowWelcomeDialog,
  setShowPopover,
  setIsFilterDialogOpen,
} = userOnboardingSlice.actions;

export default userOnboardingSlice.reducer;
