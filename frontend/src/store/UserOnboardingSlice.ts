// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {TourType} from '../types/tours';

export interface UserOnboarding {
  tours: Record<TourType, boolean | null>;
  toursToShow: TourType | null;
  showTooltip: boolean;
  showModal: boolean;
  showPopover: boolean;
  allToursCompleted?: boolean;
}

const initialState: UserOnboarding = {
  tours: {
    districtMap: null,
    scenario: null,
    lineChart: null,
    filter: null,
  },
  toursToShow: null,
  showTooltip: false,
  showModal: true,
  showPopover: false,
  allToursCompleted: false,
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
      state.allToursCompleted = Object.values(state.tours).every((completed) => completed === true);
    },
    setToursToShow(state, action: PayloadAction<TourType | null>) {
      state.toursToShow = action.payload;
    },
    setShowTooltip(state, action: PayloadAction<boolean>) {
      state.showTooltip = action.payload;
    },
    setModalTour(state, action: PayloadAction<boolean>) {
      state.showModal = action.payload;
    },
    setShowPopover(state, action: PayloadAction<boolean>) {
      state.showPopover = action.payload;
    },
  },
});

export const {setTourCompleted, setToursToShow, setShowTooltip, setModalTour, setShowPopover} =
  userOnboardingSlice.actions;

export default userOnboardingSlice.reducer;
