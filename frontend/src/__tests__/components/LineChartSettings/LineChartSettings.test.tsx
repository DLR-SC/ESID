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

const LineChartSettingsTest: React.FC = () => {
  const selectedDistrict: District = {ags: '00000', name: 'district1', type: 'type1'};
  const selectedCompartment = 'Compartment 1';
  const [horizontalThresholds, setHorizontalThresholds] = useState<Dictionary<HorizontalThreshold>>({});

  return (
    <div data-testid='line-chart-settings'>
      <ThemeProvider theme={Theme}>
        <Provider store={Store}>
          <LineChartSettings
            selectedDistrict={selectedDistrict}
            selectedCompartment={selectedCompartment}
            horizontalThresholds={horizontalThresholds}
            setHorizontalThresholds={setHorizontalThresholds}
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

    expect(screen.getByText('Horizontal Threshold Settings')).toBeInTheDocument();
  });

  test('Navigates to all menu item in popover', async () => {
    render(<LineChartSettingsTest />);
    const settingsButton = screen.getByTestId('settings-popover-button-testid');
    await userEvent.click(settingsButton);

    // add more menus here
    const menuItems = ['Horizontal Threshold Settings'];

    for (const menuItem of menuItems) {
      await userEvent.click(screen.getByText(menuItem));
      expect(screen.getByText(menuItem)).toBeInTheDocument();

      const backButton = screen.getByTestId('settings-back-button');
      await userEvent.click(backButton);

      // Ensure we're back at the main settings menu
      expect(screen.getByText('Line Chart Settings')).toBeInTheDocument();
    }
  });

  test('Displays the settings main menu when back button is clicked from any menu', async () => {
    render(<LineChartSettingsTest />);
    const settingsButton = screen.getByTestId('settings-popover-button-testid');
    await userEvent.click(settingsButton);

    const thresholdSettingsButton = screen.getByText('Horizontal Threshold Settings');
    await userEvent.click(thresholdSettingsButton);

    const backButton = screen.getByTestId('settings-back-button');
    await userEvent.click(backButton);

    const settingsHeader = screen.getByText('Line Chart Settings');
    expect(settingsHeader).toBeInTheDocument();
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
