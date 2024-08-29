// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {describe, test, expect} from 'vitest';
import userOnboardingReducer, {
  setTourCompleted,
  setShowTooltip,
  UserOnboarding,
  setActiveTour,
  setShowWelcomeDialog,
  setShowPopover,
  setIsFilterDialogOpen,
} from '../../store/UserOnboardingSlice';
import {TourType} from 'types/tours';

describe('userOnboardingSlice', () => {
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

  test('initial state', () => {
    expect(userOnboardingReducer(undefined, {type: ''})).toEqual(initialState);
  });

  test('setActiveTour updates the active tour', () => {
    const tourType: TourType = 'scenario';
    const newState = userOnboardingReducer(initialState, setActiveTour(tourType));

    expect(newState.activeTour).toEqual(tourType);
  });

  test('complete all onboarding tours', () => {
    let newState = userOnboardingReducer(initialState, setTourCompleted({tour: 'districtMap', completed: true}));
    newState = userOnboardingReducer(newState, setTourCompleted({tour: 'scenario', completed: true}));
    newState = userOnboardingReducer(newState, setTourCompleted({tour: 'lineChart', completed: true}));
    newState = userOnboardingReducer(newState, setTourCompleted({tour: 'filter', completed: true}));
    newState = userOnboardingReducer(newState, setTourCompleted({tour: 'parameters', completed: true}));

    expect(newState.allToursCompleted).toEqual(true);
  });

  test('skip all onboarding tours', () => {
    let newState = userOnboardingReducer(initialState, setTourCompleted({tour: 'districtMap', completed: false}));
    newState = userOnboardingReducer(newState, setTourCompleted({tour: 'scenario', completed: false}));
    newState = userOnboardingReducer(newState, setTourCompleted({tour: 'lineChart', completed: false}));
    newState = userOnboardingReducer(newState, setTourCompleted({tour: 'filter', completed: false}));
    newState = userOnboardingReducer(newState, setTourCompleted({tour: 'parameters', completed: false}));

    expect(newState.allToursCompleted).toEqual(false);
  });

  test('partial completion of the tour does not set allToursCompleted to true', () => {
    let newState = userOnboardingReducer(initialState, setTourCompleted({tour: 'districtMap', completed: true}));
    newState = userOnboardingReducer(newState, setTourCompleted({tour: 'scenario', completed: true}));
    expect(newState.allToursCompleted).toEqual(false);
  });

  test('set showTooltip to true', () => {
    const newState = userOnboardingReducer(initialState, setShowTooltip(true));
    expect(newState.showTooltip).toEqual(true);
  });

  test('set showWelcomeDialog to false', () => {
    const newState = userOnboardingReducer(initialState, setShowWelcomeDialog(false));
    expect(newState.showWelcomeDialog).toEqual(false);
  });

  test('set showPopover to true', () => {
    const newState = userOnboardingReducer(initialState, setShowPopover(true));
    expect(newState.showPopover).toEqual(true);
  });

  test('set isFilterDialogOpen to true', () => {
    const newState = userOnboardingReducer(initialState, setIsFilterDialogOpen(true));
    expect(newState.isFilterDialogOpen).toEqual(true);
  });
});
