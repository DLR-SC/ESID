// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {describe, test, expect} from 'vitest';

import reducer, {
  selectHeatmapLegend,
  selectTab,
  setHorizontalYAxisThreshold,
  setHorizontalYAxisThresholds,
  setInitialVisit,
  UserPreference,
} from '../../store/UserPreferenceSlice';
import {HeatmapLegend} from '../../types/heatmapLegend';
import {District} from 'types/district';
import {HorizontalThreshold} from 'types/horizontalThreshold';

describe('DataSelectionSlice', () => {
  const initialState: UserPreference = {
    selectedHeatmap: {
      name: 'uninitialized',
      isNormalized: true,
      steps: [
        {color: 'rgb(255,255,255)', value: 0},
        {color: 'rgb(255,255,255)', value: 1},
      ],
    },
    selectedTab: '1',
    isInitialVisit: true,
    horizontalYAxisThresholds: {},
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
      horizontalYAxisThresholds: {},
    });
  });

  test('Select Parameter Tab', () => {
    expect(reducer(initialState, selectTab('2'))).toEqual({
      selectedHeatmap: {
        name: 'uninitialized',
        isNormalized: true,
        steps: [
          {color: 'rgb(255,255,255)', value: 0},
          {color: 'rgb(255,255,255)', value: 1},
        ],
      },
      selectedTab: '2',
      isInitialVisit: true,
      horizontalYAxisThresholds: {},
    });
  });

  test('Set initialVisit to true', () => {
    expect(reducer(initialState, setInitialVisit(true))).toEqual({
      selectedHeatmap: {
        name: 'uninitialized',
        isNormalized: true,
        steps: [
          {color: 'rgb(255,255,255)', value: 0},
          {color: 'rgb(255,255,255)', value: 1},
        ],
      },
      selectedTab: '1',
      isInitialVisit: true,
      horizontalYAxisThresholds: {},
    });
  });

  test('Set initialVisit to false', () => {
    expect(reducer(initialState, setInitialVisit(false))).toEqual({
      selectedHeatmap: {
        name: 'uninitialized',
        isNormalized: true,
        steps: [
          {color: 'rgb(255,255,255)', value: 0},
          {color: 'rgb(255,255,255)', value: 1},
        ],
      },
      selectedTab: '1',
      isInitialVisit: false,
      horizontalYAxisThresholds: {},
    });
  });

  test('Set horizontal thresholds', () => {
    const thresholds: Record<string, HorizontalThreshold> = {
      '11000-compartment1': {
        district: {ags: '12345', name: 'Test District', type: 'Test Type'} as District,
        compartment: 'compartment1',
        threshold: 50,
      },
    };

    expect(reducer(initialState, setHorizontalYAxisThresholds(thresholds))).toEqual({
      ...initialState,
      horizontalYAxisThresholds: thresholds,
    });
  });

  test('Add Horizontal Threshold', () => {
    const newThreshold = {
      district: {ags: '11111', name: 'district1', type: 'type1'} as District,
      compartment: 'compartment1',
      threshold: 10,
    };

    expect(reducer(initialState, setHorizontalYAxisThreshold(newThreshold))).toEqual({
      selectedHeatmap: {
        name: 'uninitialized',
        isNormalized: true,
        steps: [
          {color: 'rgb(255,255,255)', value: 0},
          {color: 'rgb(255,255,255)', value: 1},
        ],
      },
      selectedTab: '1',
      isInitialVisit: true,
      horizontalYAxisThresholds: {
        '11111-compartment1': newThreshold,
      },
    });
  });
});
