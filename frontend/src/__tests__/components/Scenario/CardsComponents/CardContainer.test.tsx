// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import CardContainer from 'components/ScenarioComponents/CardsComponents/CardContainer';
import React, {useState} from 'react';
import {filterValue, cardValue} from 'types/Cardtypes';
import {GroupFilter} from 'types/group';
import {Dictionary} from 'util/util';
import {describe, test, expect} from 'vitest';

import {render, screen} from '@testing-library/react';
import Theme from 'util/Theme';
import {ThemeProvider} from '@mui/system';

const CardContainerTest = () => {
  // Mock data for the props
  const compartmentsExpanded = true;
  const selectedCompartment = 'Compartment 1';
  const compartments = ['Compartment 1', 'Compartment 2', 'Compartment 3'];
  const minCompartmentsRows = 1;
  const maxCompartmentsRows = 3;
  const filterValues: Dictionary<filterValue[]> = {
    'Compartment 1': [
      {filteredTitle: 'Title 1', filteredValues: {'Compartment 1': 10, 'Compartment 2': 20, 'Compartment 3': 30}},
    ],
    'Compartment 2': [
      {filteredTitle: 'Title 2', filteredValues: {'Compartment 1': 10, 'Compartment 2': 20, 'Compartment 3': 30}},
    ],
    'Compartment 3': [
      {filteredTitle: 'Title 3', filteredValues: {'Compartment 1': 10, 'Compartment 2': 20, 'Compartment 3': 30}},
    ],
  };
  const scenarios = [
    {id: 0, label: 'Scenario 1'},
    {id: 1, label: 'Scenario 2'},
    {id: 2, label: 'Scenario 3'},
  ];
  const cardValues: Dictionary<cardValue> = {
    '0': {
      compartmentValues: {'Compartment 1': 10, 'Compartment 2': 20, 'Compartment 3': 30},
      startValues: {'Compartment 1': 100, 'Compartment 2': 200, 'Compartment 3': 307},
    },
    '1': {
      compartmentValues: {'Compartment 1': 40, 'Compartment 2': 50, 'Compartment 3': 60},
      startValues: {'Compartment 1': 100, 'Compartment 2': 200, 'Compartment 3': 307},
    },
    '2': {
      compartmentValues: {'Compartment 1': 70, 'Compartment 2': 80, 'Compartment 3': 90},
      startValues: {'Compartment 1': 100, 'Compartment 2': 200, 'Compartment 3': 307},
    },
  };
  const groupFilters: Dictionary<GroupFilter> = {
    '0': {
      id: 'group1',
      name: 'Group 1',
      isVisible: true,
      groups: {
        'Subgroup 1': ['Item 1', 'Item 2'],
        'Subgroup 2': ['Item 3', 'Item 4'],
      },
    },
    '1': {
      id: 'group2',
      name: 'Group 2',
      isVisible: false,
      groups: {
        'Subgroup 3': ['Item 5', 'Item 6'],
        'Subgroup 4': ['Item 7', 'Item 8'],
      },
    },
  };

  const [activeScenarios, setActiveScenarios] = useState<number[] | null>([0, 1, 2, 3]);
  const [selectedScenario, setSelectedScenario] = useState<number | null>(0);

  return (
    <div data-testid='card-container'>
      <ThemeProvider theme={Theme}>
        <CardContainer
          compartmentsExpanded={compartmentsExpanded}
          filterValues={filterValues}
          selectedCompartment={selectedCompartment}
          compartments={compartments}
          scenarios={scenarios}
          activeScenarios={activeScenarios}
          cardValues={cardValues}
          minCompartmentsRows={minCompartmentsRows}
          maxCompartmentsRows={maxCompartmentsRows}
          setActiveScenarios={setActiveScenarios}
          setSelectedScenario={setSelectedScenario}
          groupFilters={groupFilters}
          selectedScenario={selectedScenario}
        />
      </ThemeProvider>
    </div>
  );
};

describe('CardContainer', () => {
  test('renders data cards correctly', () => {
    render(<CardContainerTest />);
    expect(screen.getByTestId('card-container')).toBeInTheDocument();
  });
  test('renders filter values correctly', () => {
    render(<CardContainerTest />);

    // Check if filter values are rendered correctly for each compartment
    expect(screen.getByText('scenario-names.Scenario 1')).toBeInTheDocument();
    expect(screen.getByText('scenario-names.Scenario 2')).toBeInTheDocument();
    expect(screen.getByText('scenario-names.Scenario 3')).toBeInTheDocument();
  });
  const compartments: string[] = ['Compartment 1', 'Compartment 2', 'Compartment 3'];

  const filterValues: Dictionary<filterValue[]> = {
    'Compartment 1': [
      {filteredTitle: 'Title 1', filteredValues: {'Compartment 1': 10, 'Compartment 2': 20, 'Compartment 3': 30}},
    ],
    'Compartment 2': [
      {filteredTitle: 'Title 2', filteredValues: {'Compartment 1': 10, 'Compartment 2': 20, 'Compartment 3': 30}},
    ],
    'Compartment 3': [
      {filteredTitle: 'Title 3', filteredValues: {'Compartment 1': 10, 'Compartment 2': 20, 'Compartment 3': 30}},
    ],
  };

  test('renders compartments correctly', async () => {
    render(<CardContainerTest />);

    // Check if compartment values are rendered correctly
    for (const compartment of compartments) {
      for (const {filteredValues} of filterValues[compartment]) {
        if (filteredValues) {
          for (const value of Object.values(filteredValues)) {
            expect(await screen.findByText(value.toString())).toBeInTheDocument();
          }
        }
      }
    }
  });
});
