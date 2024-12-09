// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import {render, screen} from '@testing-library/react';
import {describe, test, expect} from 'vitest';
import {ThemeProvider} from '@mui/material/styles';
import CardRows from 'components/ScenarioComponents/CardsComponents/MainCard/CardRows';
import Theme from 'util/Theme';

describe('CardRows Component', () => {
  const compartments = ['Compartment 1', 'Compartment 2'];
  const compartmentValues = {
    'Compartment 1': 100,
    'Compartment 2': 200,
  };
  const startValues = {
    'Compartment 1': 50,
    'Compartment 2': 100,
  };
  const selectedCompartment = 'Compartment 1';
  const color = '#000000';
  const minCompartmentsRows = 1;
  const maxCompartmentsRows = 2;

  test('renders compartment values and rates correctly', () => {
    render(
      <ThemeProvider theme={Theme}>
        <CardRows
          index={0}
          compartments={compartments}
          compartmentValues={compartmentValues}
          referenceValues={startValues}
          selectedCompartmentId={selectedCompartment}
          color={color}
          minCompartmentsRows={minCompartmentsRows}
          maxCompartmentsRows={maxCompartmentsRows}
        />
      </ThemeProvider>
    );

    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('200')).toBeInTheDocument();
    expect(screen.getAllByText('+100%')).toHaveLength(2);
  });

  test('applies the correct styles to selected compartment', () => {
    render(
      <ThemeProvider theme={Theme}>
        <CardRows
          index={0}
          compartments={compartments}
          compartmentValues={compartmentValues}
          referenceValues={startValues}
          selectedCompartmentId={selectedCompartment}
          color={color}
          minCompartmentsRows={minCompartmentsRows}
          maxCompartmentsRows={maxCompartmentsRows}
        />
      </ThemeProvider>
    );

    const selectedElement = screen.getByText('100');
    expect(selectedElement.parentElement).toHaveStyle(`background-color: rgba(0, 0, 0, 0.1)`);
  });

  test('renders with arrows when arrow prop is true', () => {
    render(
      <ThemeProvider theme={Theme}>
        <CardRows
          index={0}
          compartments={compartments}
          compartmentValues={compartmentValues}
          referenceValues={startValues}
          selectedCompartmentId={selectedCompartment}
          color={color}
          minCompartmentsRows={minCompartmentsRows}
          maxCompartmentsRows={maxCompartmentsRows}
          arrow={true}
        />
      </ThemeProvider>
    );

    expect(screen.getAllByTestId('ArrowDropUpIcon').length).toBe(2);
  });
});
