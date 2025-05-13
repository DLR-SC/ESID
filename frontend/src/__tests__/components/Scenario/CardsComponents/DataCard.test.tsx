// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {useState} from 'react';
import {render, screen} from '@testing-library/react';
import {describe, test, expect} from 'vitest';
import {Dictionary} from 'util/util';
import {GroupFilter} from 'types/group';
import {FilterValues} from 'types/card';
import Theme from 'util/Theme';
import {ThemeProvider} from '@mui/system';
import DataCard from 'components/ScenarioComponents/CardsComponents/DataCard';

const DataCardTest = () => {
  const compartmentValues: Dictionary<number> = {
    'Compartment 1': 10,
    'Compartment 2': 20,
    'Compartment 3': 30,
  };
  const refereceValues: Dictionary<number> = {
    'Compartment 1': 100,
    'Compartment 2': 200,
    'Compartment 3': 307,
  };
  const filterValues: Record<string, Array<FilterValues>> = {
    '0': [
      {filteredTitle: 'Group 1', filteredValues: {'Compartment 1': 10, 'Compartment 2': 20, 'Compartment 3': 30}},
      {filteredTitle: 'Group 2', filteredValues: {'Compartment 1': 40, 'Compartment 2': 50, 'Compartment 3': 60}},
      {filteredTitle: 'Group 3', filteredValues: {'Compartment 1': 40, 'Compartment 2': 50, 'Compartment 3': 60}},
    ],
    '1': [
      {filteredTitle: 'Group 1', filteredValues: {'Compartment 1': 10, 'Compartment 2': 20, 'Compartment 3': 30}},
      {filteredTitle: 'Group 2', filteredValues: {'Compartment 1': 40, 'Compartment 2': 50, 'Compartment 3': 60}},
      {filteredTitle: 'Group 3', filteredValues: {'Compartment 1': 40, 'Compartment 2': 50, 'Compartment 3': 60}},
    ],
    '2': [
      {filteredTitle: 'Group 1', filteredValues: {'Compartment 1': 10, 'Compartment 2': 20, 'Compartment 3': 30}},
      {filteredTitle: 'Group 2', filteredValues: {'Compartment 1': 40, 'Compartment 2': 50, 'Compartment 3': 60}},
      {filteredTitle: 'Group 3', filteredValues: {'Compartment 1': 40, 'Compartment 2': 50, 'Compartment 3': 60}},
    ],
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
        'Subgroup 1': ['Item 1', 'Item 2'],
        'Subgroup 2': ['Item 3', 'Item 4'],
      },
    },
    '2': {
      id: 'group3',
      name: 'Group 3',
      isVisible: true,
      groups: {
        'Subgroup 1': ['Item 1', 'Item 2'],
        'Subgroup 2': ['Item 3', 'Item 4'],
      },
    },
  };

  const [active, setActive] = useState<boolean>(true);
  const [selected, setSelected] = useState<boolean>(true);

  return (
    <ThemeProvider theme={Theme}>
      <DataCard
        id='0'
        compartmentValues={compartmentValues}
        referenceValues={refereceValues}
        title='Scenario 1'
        compartmentsExpanded={true}
        selectedCompartmentId='Compartment 1'
        isSelected={selected}
        color='primary'
        isActive={active}
        filterValues={filterValues}
        minCompartmentsRows={1}
        maxCompartmentsRows={3}
        setSelected={(value) => setSelected(value.state)}
        setActive={(value) => setActive(value.state)}
        groupFilters={groupFilters}
        hide={() => {}}
      />
    </ThemeProvider>
  );
};

describe('DataCard', () => {
  test('renders DataCard correctly', () => {
    render(<DataCardTest />);
    expect(screen.getByText('Scenario 1')).toBeInTheDocument();
  });

  test('renders compartment values correctly', () => {
    render(<DataCardTest />);
    // Verify if compartment values are rendered correctly
    const compartments1 = screen.getAllByText('10');
    expect(compartments1).toHaveLength(2);
    const compartments2 = screen.getAllByText('20');
    expect(compartments2).toHaveLength(2);
    const compartments3 = screen.getAllByText('30');
    expect(compartments3).toHaveLength(2);
  });

  test('renders filter titles correctly', () => {
    render(<DataCardTest />);
    // Verify if filter titles are rendered correctly
    expect(screen.getByText('Group 1')).toBeInTheDocument();
    // That's works because the element is actually in the dom but the visibility is set to false so it's not render
    expect(screen.getByText('Group 2')).toBeInTheDocument();
    expect(screen.getByText('Group 3')).toBeInTheDocument();
  });
  const GroupFilters: Dictionary<GroupFilter> = {
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
        'Subgroup 1': ['Item 1', 'Item 2'],
        'Subgroup 2': ['Item 3', 'Item 4'],
      },
    },
    '2': {
      id: 'group3',
      name: 'Group 3',
      isVisible: true,
      groups: {
        'Subgroup 1': ['Item 1', 'Item 2'],
        'Subgroup 2': ['Item 3', 'Item 4'],
      },
    },
  };
  test('checks visibility based on group filters', () => {
    render(<DataCardTest />);
    // Verify visibility based on group filters
    const group1 = screen.getByText('Group 1');
    const group2Element = screen.getByText('Group 2');
    if (GroupFilters['0'].isVisible) {
      expect(group1).toBeInTheDocument();
    } else {
      expect(group1).not.toBeInTheDocument();
    }

    if (GroupFilters['1'].isVisible) {
      expect(group2Element).toBeVisible();
    } else {
      expect(group2Element).not.toBeVisible();
    }
  });
});
