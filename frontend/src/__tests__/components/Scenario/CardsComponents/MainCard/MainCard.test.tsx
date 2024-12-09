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
  const Index = 0;
  const CompartmentValues: Dictionary<number> = {
    'Compartment 1': 10,
    'Compartment 2': 20,
    'Compartment 3': 30,
  };
  const StartValues: Dictionary<number> = {
    'Compartment 1': 100,
    'Compartment 2': 200,
    'Compartment 3': 307,
  };
  const Label = 'Scenario 1';
  const CompartmentsExpanded = true;
  const Compartments = ['Compartment 1', 'Compartment 2', 'Compartment 3'];
  const SelectedCompartment = 'Compartment 1';
  const SelectedScenario = false;
  const Hover = false;
  const Color = 'primary';
  const ActiveScenarios = [1, 2];
  const MinCompartmentsRows = 1;
  const MaxCompartmentsRows = 3;

  const [hover, setHover] = useState<boolean>(Hover);
  const [activeScenarios, setActiveScenarios] = useState<number[] | null>(ActiveScenarios);
  const [, setSelectedScenario] = useState<number | null>(Index);

  return (
    <ThemeProvider theme={Theme}>
      <MainCard
        index={Index}
        label={Label}
        hover={hover}
        compartmentValues={CompartmentValues}
        referenceValues={StartValues}
        setHover={setHover}
        compartments={Compartments}
        compartmentsExpanded={CompartmentsExpanded}
        selectedCompartmentId={SelectedCompartment}
        color={Color}
        isSelected={SelectedScenario}
        isActive={true}
        numberSelectedScenario={Index}
        minCompartmentsRows={MinCompartmentsRows}
        maxCompartmentsRows={MaxCompartmentsRows}
        setSelected={setSelectedScenario}
        setActive={setActiveScenarios}
        activeScenarios={activeScenarios}
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
    // Verify click event to select scenario
    const card = screen.getByText('Scenario 1');
    fireEvent.mouseOver(card);
    const tooltip = screen.getByLabelText('scenario.activate');
    fireEvent.click(tooltip);
    expect(screen.getByLabelText('scenario.deactivate')).toBeVisible();
  });
});
