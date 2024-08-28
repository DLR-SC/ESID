// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {useState} from 'react';
import {describe, test, expect} from 'vitest';
import {ThemeProvider} from '@emotion/react';
import {render, screen} from '@testing-library/react';
import Theme from 'util/Theme';
import CompartmentsRow from 'components/ScenarioComponents/CompartmentsComponents/CompartmentsRow';
import userEvent from '@testing-library/user-event';

const CompartmentsRowTest = () => {
  const compartmentsExpanded = true;
  const compartments = ['Compartment 1', 'Compartment 2', 'Compartment 3'];
  const [selectedCompartment, setSelectedCompartment] = useState('Compartment 1');
  const minCompartmentsRows = 1;
  const compartmentValues = {
    'Compartment 1': 10,
    'Compartment 2': 20,
    'Compartment 3': 30,
  };

  return (
    <div data-testid='compartments-rows'>
      <ThemeProvider theme={Theme}>
        {compartments.map((compartment, index) => (
          <CompartmentsRow
            id={index}
            key={index}
            selected={compartment === selectedCompartment}
            compartment={compartment}
            value={compartmentValues[compartment as keyof typeof compartmentValues].toString()}
            compartmentsExpanded={compartmentsExpanded}
            setSelectedCompartment={setSelectedCompartment}
            minCompartmentsRows={minCompartmentsRows}
          />
        ))}
      </ThemeProvider>
    </div>
  );
};

describe('CompartmentsRows', () => {
  test('renders the correct compartment names', async () => {
    render(<CompartmentsRowTest />);

    expect(await screen.findByText((content) => content.includes('Compartment 1'))).toBeInTheDocument();
    expect(await screen.findByText((content) => content.includes('Compartment 2'))).toBeInTheDocument();
    expect(await screen.findByText((content) => content.includes('Compartment 3'))).toBeInTheDocument();
  });

  test('renders the correct compartment values', async () => {
    render(<CompartmentsRowTest />);

    expect(await screen.findByText('10')).toBeInTheDocument();
    expect(await screen.findByText('20')).toBeInTheDocument();
    expect(await screen.findByText('30')).toBeInTheDocument();
  });

  test('selects the correct compartment on click', async () => {
    render(<CompartmentsRowTest />);

    const compartment1 = screen.getByText('compartments.Compartment 1').closest('div[role="button"]');
    const compartment2 = screen.getByText('compartments.Compartment 2').closest('div[role="button"]');
    expect(compartment1).toHaveClass('Mui-selected');
    expect(compartment2).not.toHaveClass('Mui-selected');
    if (compartment2) {
      await userEvent.click(compartment2);
    }
    expect(compartment1).not.toHaveClass('Mui-selected');
    expect(compartment2).toHaveClass('Mui-selected');
  });
});
