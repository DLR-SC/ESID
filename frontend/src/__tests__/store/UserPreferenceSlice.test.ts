import reducer, {
  selectDefaultLegend,
  selectHeatmapLegend,
  setDefaultLegends,
  setHeatmapLegends,
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
    heatmaps: [],
    defaultHeatmaps: [],
  };
  const defaultHeatmaps: HeatmapLegend[] = [
    {
      name: 'Default',
      isNormalized: true,
      steps: [
        {color: 'rgb(255,255,255)', value: 0},
        {color: 'rgb(255,0,0)', value: 1},
      ],
    },
    {
      name: 'Default',
      isNormalized: true,
      steps: [
        {color: 'rgb(255,255,255)', value: 0},
        {color: 'rgb(0,255,0)', value: 1},
      ],
    },
    {
      name: 'Default',
      isNormalized: true,
      steps: [
        {color: 'rgb(255,255,255)', value: 0},
        {color: 'rgb(0,0,255)', value: 1},
      ],
    },
  ];

  test('Initial State', () => {
    expect(reducer(undefined, {type: null})).toEqual(initialState);
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
      heatmaps: [],
      defaultHeatmaps: [],
    });
  });

  test('Set Heatmap Legends', () => {
    const legends: HeatmapLegend[] = [
      {
        name: 'test 1',
        isNormalized: true,
        steps: [
          {color: 'rgb(255,255,255)', value: 0},
          {color: 'rgb(204,11,234)', value: 1},
        ],
      },
      {
        name: 'test 2',
        isNormalized: false,
        steps: [
          {color: 'rgb(94,254,76)', value: 0},
          {color: 'rgb(225,199,18)', value: 150},
          {color: 'rgb(194,96,14)', value: 500},
          {color: 'rgb(164,25,42)', value: 2000},
        ],
      },
    ];

    expect(reducer(initialState, setHeatmapLegends({legends: legends}))).toEqual({
      selectedHeatmap: {
        name: 'uninitialized',
        isNormalized: true,
        steps: [
          {color: 'rgb(255,255,255)', value: 0},
          {color: 'rgb(255,255,255)', value: 1},
        ],
      },
      heatmaps: legends,
      defaultHeatmaps: [],
    });
  });
  test('Set Default Legends', () => {
    expect(reducer(initialState, setDefaultLegends({legends: defaultHeatmaps}))).toEqual({
      selectedHeatmap: {
        name: 'uninitialized',
        isNormalized: true,
        steps: [
          {color: 'rgb(255,255,255)', value: 0},
          {color: 'rgb(255,255,255)', value: 1},
        ],
      },
      heatmaps: [],
      defaultHeatmaps: defaultHeatmaps,
    });
  });
  test('Change Scenario while Default Legend is selected', () => {
    const state: UserPreference = {
      selectedHeatmap: defaultHeatmaps[0],
      heatmaps: [defaultHeatmaps[0]],
      defaultHeatmaps: defaultHeatmaps,
    };
    expect(reducer(state, selectDefaultLegend({selectedScenario: 1}))).toEqual({
      selectedHeatmap: defaultHeatmaps[1],
      heatmaps: [defaultHeatmaps[1]],
      defaultHeatmaps: defaultHeatmaps,
    });
  });
  test('Change Scenario while Default Legend is not Selected', () => {
    const state: UserPreference = {
      selectedHeatmap: initialState.selectedHeatmap,
      heatmaps: [defaultHeatmaps[0]],
      defaultHeatmaps: defaultHeatmaps,
    };
    expect(reducer(state, selectDefaultLegend({selectedScenario: 1}))).toEqual({
      selectedHeatmap: initialState.selectedHeatmap,
      heatmaps: [defaultHeatmaps[1]],
      defaultHeatmaps: defaultHeatmaps,
    });
  });
});
