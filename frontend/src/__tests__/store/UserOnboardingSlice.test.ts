// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {describe, test, expect} from 'vitest';
import userOnboardingReducer, {setTourCompleted, setShowTooltip, UserOnboarding} from '../../store/UserOnboardingSlice';
import {TourType} from 'types/tours';

describe('userOnboardingSlice', () => {
  const initialState: UserOnboarding = {
    tours: {
      districtMap: null,
      scenario: null,
      lineChart: null,
      filter: null,
    },
    showTooltip: false,
  };

  test('initial state', () => {
    expect(userOnboardingReducer(undefined, {type: ''})).toEqual(initialState);
  });

  test('complete all onboarding tours', () => {
    let newState = userOnboardingReducer(initialState, setTourCompleted({tour: 'districtMap', completed: true}));
    newState = userOnboardingReducer(newState, setTourCompleted({tour: 'scenario', completed: true}));
    newState = userOnboardingReducer(newState, setTourCompleted({tour: 'lineChart', completed: true}));
    newState = userOnboardingReducer(newState, setTourCompleted({tour: 'filter', completed: true}));

    expect(newState.tours.districtMap).toEqual(true);
    expect(newState.tours.scenario).toEqual(true);
    expect(newState.tours.lineChart).toEqual(true);
    expect(newState.tours.filter).toEqual(true);
  });

  test('skip all onboarding tours', () => {
    let newState = userOnboardingReducer(initialState, setTourCompleted({tour: 'districtMap', completed: false}));
    newState = userOnboardingReducer(newState, setTourCompleted({tour: 'scenario', completed: false}));
    newState = userOnboardingReducer(newState, setTourCompleted({tour: 'lineChart', completed: false}));
    newState = userOnboardingReducer(newState, setTourCompleted({tour: 'filter', completed: false}));

    expect(newState.tours.districtMap).toEqual(false);
    expect(newState.tours.scenario).toEqual(false);
    expect(newState.tours.lineChart).toEqual(false);
    expect(newState.tours.filter).toEqual(false);
  });

  test('complete only districtMap tour', () => {
    const tourType: TourType = 'districtMap';
    const newState = userOnboardingReducer(initialState, setTourCompleted({tour: tourType, completed: true}));
    expect(newState.tours.districtMap).toEqual(true);
  });

  test('set showTooltip to true', () => {
    const newState = userOnboardingReducer(initialState, setShowTooltip(true));
    expect(newState.showTooltip).toEqual(true);
  });
});
