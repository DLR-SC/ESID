// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {describe, test, expect} from 'vitest';

import reducer, {
  selectHeatmapLegend,
  selectTab,
  setInitialVisit,
  UserPreference,
} from '../../store/UserPreferenceSlice';
import {HeatmapLegend} from '../../types/heatmapLegend';

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
    });
  });
});
