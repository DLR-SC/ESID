// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import LineChart from 'components/LineChartComponents/LineChart';
import React from 'react';
import {render, screen} from '@testing-library/react';
import {describe, test, expect} from 'vitest';

describe('LineChart', () => {
  test('renders LineChart', () => {
    render(
      <div data-testid='chartdiv'>
        <LineChart selectedDate={''} setSelectedDate={() => {}} caseData={undefined} selectedCompartment={''} />
      </div>
    );

    expect(screen.getByTestId('chartdiv')).toBeInTheDocument();
  });
});
