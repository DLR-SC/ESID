// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import CompartmentsRows from 'components/ScenarioComponents/CompartmentsComponents/CompartmentsRows';
import React, {useState} from 'react';
import {describe, test, expect} from 'vitest';
import {ThemeProvider} from '@emotion/react';
import {render, screen, waitFor} from '@testing-library/react';
import Theme from 'util/Theme';

const CompartmentsRowsTest = () => {
  const compartmentsExpanded = true;
  const compartments = ['Compartment 1', 'Compartment 2', 'Compartment 3'];
  const [selectedCompartment, setSelectedCompartment] = useState('Compartment 1');
  const minCompartmentsRows = 1;
  const maxCompartmentsRows = 3;
  const compartmentValues = {
    'Compartment 1': 10,
    'Compartment 2': 20,
    'Compartment 3': 30,
  };

  return (
    <div data-testid='compartments-rows'>
      <ThemeProvider theme={Theme}>
        <CompartmentsRows
          compartmentsExpanded={compartmentsExpanded}
          compartments={compartments}
          selectedCompartment={selectedCompartment}
          setSelectedCompartment={setSelectedCompartment}
          minCompartmentsRows={minCompartmentsRows}
          maxCompartmentsRows={maxCompartmentsRows}
          compartmentValues={compartmentValues}
        />
      </ThemeProvider>
    </div>
  );
};

describe('CompartmentsRows', () => {
  test('renders the correct number of compartments', async () => {
    render(<CompartmentsRowsTest />);
    await waitFor(() => {
      const compartmentsList = screen.getByTestId('compartments-rows');
      expect(compartmentsList).toBeInTheDocument();
      expect(compartmentsList.querySelectorAll('.MuiListItemButton-root').length).toBe(3);
    });
  });

  test('renders the correct compartment names', async () => {
    render(<CompartmentsRowsTest />);
    expect(await screen.findByText('compartments.Compartment 1')).toBeInTheDocument();
    expect(await screen.findByText('compartments.Compartment 2')).toBeInTheDocument();
    expect(await screen.findByText('compartments.Compartment 3')).toBeInTheDocument();
  });
});
