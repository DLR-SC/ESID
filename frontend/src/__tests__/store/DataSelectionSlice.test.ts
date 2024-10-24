// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {describe, test, expect} from 'vitest';

import reducer, {
  setGroupFilter,
  selectCompartment,
  selectDate,
  selectDistrict,
  selectScenario,
} from '../../store/DataSelectionSlice';

describe('DataSelectionSlice', () => {
  const initialState = {
    district: {ags: '00000', name: '', type: ''},
    date: null,
    scenario: 0,
    compartment: null,
    compartmentsExpanded: null,
    activeScenarios: [0],
    simulationStart: null,
    minDate: null,
    maxDate: null,
    groupFilters: {},
  };

  test('Initial State', () => {
    expect(reducer(undefined, {type: ''})).toEqual(initialState);
  });

  test('Select District', () => {
    const newDistrict = {ags: '12345', name: 'Test District', type: 'Test Type'};
    expect(reducer(initialState, selectDistrict(newDistrict))).toEqual(
      Object.assign(initialState, {district: newDistrict})
    );
  });

  test('Select Date', () => {
    const newDate = '2020-09-21';
    expect(reducer(initialState, selectDate(newDate))).toEqual(Object.assign(initialState, {date: newDate}));
  });

  test('Select Scenario', () => {
    const scenario = 1;
    expect(reducer(initialState, selectScenario(scenario))).toEqual(Object.assign(initialState, {scenario: scenario}));
  });

  test('Select Compartment', () => {
    const compartment = 'Test Compartment';
    expect(reducer(initialState, selectCompartment(compartment))).toEqual(
      Object.assign(initialState, {compartment: compartment})
    );
  });

  test('Add Group Filter', () => {
    const newFilter = {
      id: 'c9c241fb-c0bd-4710-94b9-f4c9ad98072b',
      name: 'Test Group',
      groups: {age: ['age_1', 'age_2'], gender: ['male', 'female']},
      isVisible: false,
    };
    expect(reducer(initialState, setGroupFilter(newFilter))).toEqual(
      Object.assign(initialState, {groupFilters: {'c9c241fb-c0bd-4710-94b9-f4c9ad98072b': newFilter}})
    );
  });
});
