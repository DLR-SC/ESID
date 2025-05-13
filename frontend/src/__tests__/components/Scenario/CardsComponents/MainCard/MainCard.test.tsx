// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {useState} from 'react';
import {render, screen, fireEvent} from '@testing-library/react';
import {describe, test, expect} from 'vitest';
import {ThemeProvider} from '@mui/material';
import Theme from 'util/Theme';
import MainCard from 'components/ScenarioComponents/CardsComponents/MainCard/MainCard';
import {Dictionary} from 'util/util';

const MainCardTest = () => {
  const compartmentValues: Dictionary<number> = {
    'Compartment 1': 10,
    'Compartment 2': 20,
    'Compartment 3': 30,
  };
  const referenceValues: Dictionary<number> = {
    'Compartment 1': 100,
    'Compartment 2': 200,
    'Compartment 3': 307,
  };

  const [hover, setHover] = useState<boolean>(false);
  const [active, setActive] = useState<boolean>(false);
  const [selected] = useState<boolean>(false);

  return (
    <ThemeProvider theme={Theme}>
      <MainCard
        id='0'
        label='Scenario 1'
        hover={hover}
        compartmentValues={compartmentValues}
        referenceValues={referenceValues}
        setHover={setHover}
        compartmentsExpanded={true}
        selectedCompartmentId='Compartment 1'
        color='primary'
        isSelected={selected}
        isActive={active}
        minCompartmentsRows={1}
        setSelected={() => {}}
        setActive={(value) => setActive(value.state)}
        hide={() => {}}
        maxCompartmentsRows={3}
        arrow={true}
      />
    </ThemeProvider>
  );
};

describe('MainCard', () => {
  test('renders MainCard correctly', () => {
    render(<MainCardTest />);
    expect(screen.getByText('Scenario 1')).toBeInTheDocument();
  });

  test('renders compartment values correctly', () => {
    render(<MainCardTest />);
    // Verify if compartment values are rendered correctly
    const compartments1 = screen.getAllByText('10');
    expect(compartments1).toHaveLength(1);
    const compartments2 = screen.getAllByText('20');
    expect(compartments2).toHaveLength(1);
    const compartments3 = screen.getAllByText('30');
    expect(compartments3).toHaveLength(1);
  });

  test('handles click event to activate and renders tooltip correctly on hover scenario', () => {
    render(<MainCardTest />);
    // Verify click event to select a scenario
    const card = screen.getByText('Scenario 1');
    fireEvent.mouseOver(card);
    const checkbox = screen.getByLabelText('scenario.activate');
    fireEvent.click(checkbox);
    expect(screen.getByLabelText('scenario.deactivate')).toBeVisible();
  });
});
