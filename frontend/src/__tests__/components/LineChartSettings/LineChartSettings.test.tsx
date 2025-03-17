// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {render, screen, waitFor} from '@testing-library/react';
import {describe, test, expect} from 'vitest';
import React, {useState} from 'react';
import {ThemeProvider} from '@mui/system';
import Theme from 'util/Theme';
import {LineChartSettings} from 'components/LineChartComponents/LineChartSettingsComponents/LineChartSettings';
import {Provider} from 'react-redux';
import {Store} from '../../../store';
import {Dictionary} from 'util/util';
import {District} from 'types/district';
import {HorizontalThreshold} from 'types/horizontalThreshold';
import {userEvent} from '@testing-library/user-event';
import {GroupFilter} from 'types/group';
import {GroupCategories, GroupSubcategories} from 'store/services/groupApi';

const LineChartSettingsTest: React.FC = () => {
  const selectedDistrict: District = {ags: '00000', name: 'district1', type: 'type1'};
  const selectedCompartment = 'Compartment 1';
  const [horizontalThresholds, setHorizontalThresholds] = useState<Dictionary<HorizontalThreshold>>({});
  const [groupFilters, setGroupFilters] = useState<Dictionary<GroupFilter>>({});
  const mockGroupCategories: GroupCategories = {
    count: 2,
    next: null,
    previous: null,
    results: [
      {
        key: 'age',
        name: 'Age',
        description: 'Filters by age groups.',
      },
      {
        key: 'gender',
        name: 'Gender',
        description: 'Filters by gender categories.',
      },
    ],
  };

  const mockGroupSubcategories: GroupSubcategories = {
    count: 4,
    next: null,
    previous: null,
    results: [
      {
        key: 'age_0_10',
        name: '0-10 years',
        description: 'Age group for children.',
        category: 'age',
      },
      {
        key: 'age_11_20',
        name: '11-20 years',
        description: 'Age group for teenagers.',
        category: 'age',
      },
      {
        key: 'male',
        name: 'Male',
        description: 'Gender: Male.',
        category: 'gender',
      },
      {
        key: 'female',
        name: 'Female',
        description: 'Gender: Female.',
        category: 'gender',
      },
    ],
  };

  return (
    <div data-testid='line-chart-settings'>
      <ThemeProvider theme={Theme}>
        <Provider store={Store}>
          <LineChartSettings
            selectedDistrict={selectedDistrict}
            selectedCompartment={selectedCompartment}
            horizontalThresholds={horizontalThresholds}
            setHorizontalThresholds={setHorizontalThresholds}
            groupFilters={groupFilters}
            setGroupFilters={setGroupFilters}
            groupCategories={mockGroupCategories?.results}
            groupSubCategories={mockGroupSubcategories?.results}
          />
        </Provider>
      </ThemeProvider>
    </div>
  );
};

describe('LineChartSettings', () => {
  test('should render LineChartSettings Popover', () => {
    render(<LineChartSettingsTest />);
    expect(screen.getByTestId('line-chart-settings')).toBeInTheDocument();

    const settingsButton = screen.getByTestId('settings-popover-button-testid');
    expect(settingsButton).toBeInTheDocument();
  });

  test('renders popover on click', async () => {
    render(<LineChartSettingsTest />);
    const settingsButton = screen.getByTestId('settings-popover-button-testid');
    await userEvent.click(settingsButton);
    expect(screen.getByTestId('line-chart-settings-popover-testid')).toBeInTheDocument();
  });

  test('renders menu items in popover', async () => {
    render(<LineChartSettingsTest />);

    const settingsButton = screen.getByTestId('settings-popover-button-testid');
    await userEvent.click(settingsButton);

    expect(screen.getByTestId('settings-menu-item-horizontalThreshold')).toBeInTheDocument();
    expect(screen.getByTestId('settings-menu-item-filters')).toBeInTheDocument();
  });

  test('Navigates to all menu item in popover', async () => {
    render(<LineChartSettingsTest />);
    const settingsButton = screen.getByTestId('settings-popover-button-testid');
    await userEvent.click(settingsButton);

    // add more menus here
    const menuItemsTestId = [
      {
        settingsMenu: 'settings-menu-item-horizontalThreshold',
        menuContainer: 'horizontalThresholdSettings-setting-container',
      },
      {
        settingsMenu: 'settings-menu-item-filters',
        menuContainer: 'filters-setting-container',
      },
    ];

    for (const menuItem of menuItemsTestId) {
      await userEvent.click(screen.getByTestId(menuItem.settingsMenu));
      expect(screen.getByTestId(menuItem.menuContainer)).toBeInTheDocument();

      const backButton = screen.getByTestId('settings-back-button');
      await userEvent.click(backButton);

      // Ensure we're back at the main settings menu
      expect(screen.getByTestId('main-settings-menu')).toBeInTheDocument();
    }
  });

  test('closes the popover when close button is clicked', async () => {
    render(<LineChartSettingsTest />);

    // Open the popover
    const settingsButton = screen.getByTestId('settings-popover-button-testid');
    await userEvent.click(settingsButton);
    expect(screen.getByTestId('line-chart-settings-popover-testid')).toBeInTheDocument();

    // Find and click the close button
    const closeButton = screen.getByTestId('settings-close-button');
    await userEvent.click(closeButton);

    // Assert that the popover is no longer in the document
    await waitFor(() => {
      expect(screen.queryByTestId('line-chart-settings-popover-testid')).not.toBeInTheDocument();
    });
  });
});
