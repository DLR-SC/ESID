// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {describe, test, expect} from 'vitest';

import reducer, {
  selectHeatmapLegend,
  selectTab,
  addHorizontalYAxisThreshold,
  updateHorizontalYAxisThreshold,
  removeHorizontalYAxisThreshold,
  setInitialVisit,
  UserPreference,
} from '@/store/UserPreferenceSlice';
import {HeatmapLegend} from '@/types/heatmapLegend';
import {District} from 'types/district';
import {Threshold} from 'types/threshold';

describe('DataSelectionSlice', () => {
  const initialState: UserPreference = {
    selectedHeatmap: {
      name: 'Default',
      isNormalized: true,
      steps: [
        {color: 'rgb(255,255,255)', value: 0},
        {color: 'rgb(255,255,255)', value: 1},
      ],
    },
    selectedTab: '1',
    isInitialVisit: true,
    horizontalYAxisThresholds: {},
    scenarioColors: {},
  };

  test('Initial State', () => {
    expect(reducer(undefined, {type: ''})).toEqual(initialState);
  });

  test('Select Heatmap Legend', () => {
    const legend: HeatmapLegend = {
      name: 'test',
      isNormalized: true,
      steps: [
        {color: 'rgb(255,255,255)', value: 0},
        {color: 'rgb(204,11,234)', value: 1},
      ],
    };
    expect(reducer(initialState, selectHeatmapLegend({legend: legend}))).toEqual({
      selectedHeatmap: legend,
      selectedTab: '1',
      isInitialVisit: true,
      scenarioColors: {},
      horizontalYAxisThresholds: {},
    });
  });

  test('Select Parameter Tab', () => {
    expect(reducer(initialState, selectTab('2'))).toEqual({
      selectedHeatmap: {
        name: 'Default',
        isNormalized: true,
        steps: [
          {color: 'rgb(255,255,255)', value: 0},
          {color: 'rgb(255,255,255)', value: 1},
        ],
      },
      selectedTab: '2',
      isInitialVisit: true,
      scenarioColors: {},
      horizontalYAxisThresholds: {},
    });
  });

  test('Set initialVisit to true', () => {
    expect(reducer(initialState, setInitialVisit(true))).toEqual({
      selectedHeatmap: {
        name: 'Default',
        isNormalized: true,
        steps: [
          {color: 'rgb(255,255,255)', value: 0},
          {color: 'rgb(255,255,255)', value: 1},
        ],
      },
      selectedTab: '1',
      isInitialVisit: true,
      scenarioColors: {},
      horizontalYAxisThresholds: {},
    });
  });

  test('Set initialVisit to false', () => {
    expect(reducer(initialState, setInitialVisit(false))).toEqual({
      selectedHeatmap: {
        name: 'Default',
        isNormalized: true,
        steps: [
          {color: 'rgb(255,255,255)', value: 0},
          {color: 'rgb(255,255,255)', value: 1},
        ],
      },
      selectedTab: '1',
      isInitialVisit: false,
      scenarioColors: {},
      horizontalYAxisThresholds: {},
    });
  });

  test('Add Horizontal Threshold', () => {
    const newThreshold = {
      district: {id: '1', nuts: '11111', name: 'district1', type: 'type1'} as District,
      compartment: 'compartment1',
      threshold: 10,
    } as Threshold;
    expect(
      reducer(initialState, addHorizontalYAxisThreshold({key: '1-compartment1', threshold: newThreshold}))
    ).toEqual({
      ...initialState,
      horizontalYAxisThresholds: {
        '1-compartment1': newThreshold,
      },
    });
  });

  test('Add Horizontal Threshold when horizontalYAxisThresholds is undefined', () => {
    const stateWithUndefinedThresholds = {
      ...initialState,
      horizontalYAxisThresholds: undefined,
    };

    const newThreshold = {
      district: {id: '1', nuts: '11111', name: 'district1', type: 'type1'} as District,
      compartment: 'compartment1',
      threshold: 10,
    } as Threshold;

    expect(
      reducer(
        stateWithUndefinedThresholds,
        addHorizontalYAxisThreshold({key: '11111-compartment1', threshold: newThreshold})
      )
    ).toEqual({
      ...stateWithUndefinedThresholds,
      horizontalYAxisThresholds: {
        '11111-compartment1': newThreshold,
      },
    });
  });

  test('Update Horizontal Threshold', () => {
    const newThreshold = {
      district: {id: '1', nuts: '11111', name: 'district1', type: 'type1'} as District,
      compartment: 'compartment2',
      threshold: 20,
    } as Threshold;

    const initialStateWithThreshold = {
      ...initialState,
      horizontalYAxisThresholds: {
        '11111-compartment1': {
          district: {id: '1', nuts: '11111', name: 'district1', type: 'type1'} as District,
          compartment: 'compartment1',
          threshold: 10,
        } as Threshold,
      },
    };
    expect(
      reducer(
        initialStateWithThreshold,
        updateHorizontalYAxisThreshold({key: '11111-compartment1', threshold: newThreshold})
      )
    ).toEqual({
      ...initialStateWithThreshold,
      horizontalYAxisThresholds: {
        '11111-compartment1': {
          district: {id: '1', nuts: '11111', name: 'district1', type: 'type1'} as District,
          compartment: 'compartment2',
          threshold: 20,
        } as Threshold,
      },
    });
  });

  test('Remove Horizontal Threshold', () => {
    const initialStateWithThreshold = {
      ...initialState,
      horizontalYAxisThresholds: {
        '11111-compartment1': {
          district: {id: '1', nuts: '11111', name: 'district1', type: 'type1'} as District,
          compartment: 'compartment1',
          threshold: 10,
        } as Threshold,
      },
    };
    expect(reducer(initialStateWithThreshold, removeHorizontalYAxisThreshold('11111-compartment1'))).toEqual({
      ...initialStateWithThreshold,
      horizontalYAxisThresholds: {},
    });
  });
});
