// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {useMemo, useRef, useState} from 'react';
import {describe, test, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import * as am5 from '@amcharts/amcharts5';
import HeatMap from 'components/Sidebar/MapComponents/HeatMap';
import {ThemeProvider} from '@mui/system';
import Theme from 'util/Theme';
import {FeatureCollection, GeoJsonProperties} from 'geojson';

const HeatMapTest = () => {
  const geoData = useMemo(() => {
    return {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {
            RS: '09771',
            GEN: 'Aichach-Friedberg',
            BEZ: 'LK',
          },
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [10.0, 50.0],
                [11.0, 50.0],
                [11.0, 51.0],
                [10.0, 51.0],
                [10.0, 50.0],
              ],
            ],
          },
        },
        {
          type: 'Feature',
          properties: {
            RS: '12345',
            GEN: 'Test District',
            BEZ: 'Test Type',
          },
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [12.0, 52.0],
                [13.0, 52.0],
                [13.0, 53.0],
                [12.0, 53.0],
                [12.0, 52.0],
              ],
            ],
          },
        },
      ],
    };
  }, []);
  const values = useMemo(() => {
    return [
      {id: '09771', value: 1},
      {id: '12345', value: 2},
    ];
  }, []);

  const defaultValue = useMemo(
    () => ({
      RS: '00000',
      GEN: 'germany',
      BEZ: '',
      id: -1,
    }),
    []
  );

  const [selectedArea, setSelectedArea] = useState<GeoJsonProperties>(defaultValue);
  const [aggregatedMax, setAggregatedMax] = useState<number>(1);
  const legend = useMemo(() => {
    return {
      name: 'uninitialized',
      isNormalized: true,
      steps: [
        {color: 'rgb(255,255,255)', value: 0},
        {color: 'rgb(255,255,255)', value: 1},
      ],
    };
  }, []);

  const legendRef = useRef<am5.HeatLegend | null>(null);

  return (
    <div data-testid='map'>
      <HeatMap
        mapData={geoData as FeatureCollection}
        defaultSelectedValue={defaultValue}
        values={values}
        setSelectedArea={setSelectedArea}
        selectedArea={selectedArea}
        aggregatedMax={aggregatedMax}
        setAggregatedMax={setAggregatedMax}
        legend={legend}
        legendRef={legendRef}
        areaId={'RS'}
      />
    </div>
  );
};

describe('HeatMap', () => {
  test('renders HeatMap component', () => {
    render(
      <ThemeProvider theme={Theme}>
        <HeatMapTest />
      </ThemeProvider>
    );

    expect(screen.getByTestId('map')).toBeInTheDocument();
  });
});
