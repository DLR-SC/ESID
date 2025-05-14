// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import CardContainer from '@/components/ScenarioComponents/CardsComponents/CardContainer';
import React, {useState} from 'react';
import {FilterValues} from '@/types/card';
import {GroupFilter} from '@/types/group';
import {describe, test, expect} from 'vitest';
import {I18nextProvider} from 'react-i18next';
import i18n from 'util/i18nForTests';
import {render, screen} from '@testing-library/react';
import Theme from '@/util/Theme';
import {ThemeProvider} from '@mui/system';

const CardContainerTest = () => {
  // Mock data for the props
  const filterValues: Record<string, Array<FilterValues>> = {
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
  const cardValues: Record<string, Record<string, number | null>> = {
    '0': {
      'Compartment 1': 10,
      'Compartment 2': 20,
      'Compartment 3': 30,
    },
    '1': {
      'Compartment 1': 40,
      'Compartment 2': 50,
      'Compartment 3': 60,
    },
    '2': {
      'Compartment 1': 70,
      'Compartment 2': 80,
      'Compartment 3': 90,
    },
  };
  const groupFilters: Record<string, GroupFilter> = {
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

  const [scenarios, setScenarios] = useState<Array<{id: string; name: string; color: string; active: boolean}>>([
    {id: '0', name: 'Scenario 1', color: 'red', active: true},
    {id: '1', name: 'Scenario 2', color: 'green', active: true},
    {id: '2', name: 'Scenario 3', color: 'blue', active: true},
  ]);
  const [selectedScenario, setSelectedScenario] = useState<string>('0');

  return (
    <div data-testid='card-container'>
      <ThemeProvider theme={Theme}>
        <I18nextProvider i18n={i18n}>
          <CardContainer
            compartmentsExpanded={true}
            filterValues={filterValues}
            selectedCompartmentId='Compartment 1'
            scenarios={scenarios}
            cardValues={cardValues}
            minCompartmentsRows={1}
            maxCompartmentsRows={3}
            setActiveScenario={(value) =>
              setScenarios(
                scenarios.map((scenario) => (scenario.id === value.id ? {...scenario, active: value.state} : scenario))
              )
            }
            setSelectedScenario={(value) => setSelectedScenario(value.id)}
            groupFilters={groupFilters}
            selectedScenario={selectedScenario}
            referenceValues={undefined}
            hide={() => {}}
          />
        </I18nextProvider>
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
    expect(screen.getByText('Scenario 1')).toBeInTheDocument();
    expect(screen.getByText('Scenario 2')).toBeInTheDocument();
    expect(screen.getByText('Scenario 3')).toBeInTheDocument();
  });
  const compartments: string[] = ['Compartment 1', 'Compartment 2', 'Compartment 3'];

  const filterValues: Record<string, FilterValues[]> = {
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
