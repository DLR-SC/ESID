// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {useMemo} from 'react';
import {describe, test, expect} from 'vitest';
import {render} from '@testing-library/react';
import {ThemeProvider} from '@mui/system';
import Theme from 'util/Theme';
import HeatLegend from 'components/Sidebar/MapComponents/HeatLegend';

const HeatLegendTest = () => {
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
  return <HeatLegend legend={legend} min={0} max={1} displayText={false} />;
};

describe('HeatLegend', () => {
  test('renders HeatLegend component', () => {
    render(
      <ThemeProvider theme={Theme}>
        <HeatLegendTest />
      </ThemeProvider>
    );

    const canvasElement = document.querySelector('canvas');
    expect(canvasElement).toBeInTheDocument();
  });
});
