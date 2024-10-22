import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, test, expect} from 'vitest';
import React, {useState} from 'react';
import {ThemeProvider} from '@mui/system';
import Theme from 'util/Theme';
import {Provider} from 'react-redux';
import {Store} from 'store';
import {Dictionary} from 'util/util';
import {District} from 'types/district';
import {HorizontalThreshold} from 'types/horizontalThreshold';
import HorizontalThresholdList from 'components/LineChartComponents/LineChartSettingsComponents/HorizontalThresholdSettings/HorizontalThresholdList';

type HorizontalThresholdListTestProps = {
  selectedDistrict?: District;
  selectedCompartment?: string;
};

const HorizontalThresholdListTest: React.FC<HorizontalThresholdListTestProps> = ({
  selectedDistrict = {ags: '02000', name: 'district4', type: 'type4'},
  selectedCompartment = 'Compartment 4',
}) => {
  const currentHorizontalThresholds: Dictionary<HorizontalThreshold> = {
    '00000-Compartment 1': {
      threshold: 10,
      district: {ags: '00000', name: 'district1', type: 'type1'},
      compartment: 'Compartment 1',
    },
    '00000-Compartment 2': {
      threshold: 20,
      district: {ags: '00000', name: 'district1', type: 'type1'},
      compartment: 'Compartment 2',
    },
    '01001-Compartment 2': {
      threshold: 50,
      district: {ags: '01001', name: 'district2', type: 'type2'},
      compartment: 'Compartment 2',
    },
    '01001-Compartment 3': {
      threshold: 60,
      district: {ags: '01001', name: 'district2', type: 'type2'},
      compartment: 'Compartment 3',
    },
    '01059-Compartment 1': {
      threshold: 70,
      district: {ags: '01059', name: 'district3', type: 'type3'},
      compartment: 'Compartment 1',
    },
    '01059-Compartment 3': {
      threshold: 90,
      district: {ags: '01059', name: 'district3', type: 'type3'},
      compartment: 'Compartment 3',
    },
  };

  const [horizontalThresholds, setHorizontalThresholds] =
    useState<Dictionary<HorizontalThreshold>>(currentHorizontalThresholds);

  return (
    <div data-testid='horizontal-threshold-list'>
      <Provider store={Store}>
        <ThemeProvider theme={Theme}>
          <HorizontalThresholdList
            horizontalThresholds={horizontalThresholds}
            setHorizontalThresholds={setHorizontalThresholds}
            selectedDistrict={selectedDistrict}
            selectedCompartment={selectedCompartment}
          />
        </ThemeProvider>
      </Provider>
    </div>
  );
};

describe('HorizontalThresholdSettingsList Component', () => {
  test('should render the HorizontalThresholdList', () => {
    render(<HorizontalThresholdListTest />);
    const horizontalThresholdList = screen.getByTestId('horizontal-threshold-list');
    expect(horizontalThresholdList).toBeInTheDocument();
  });

  const horizontalThresholds: Dictionary<HorizontalThreshold> = {
    '00000-Compartment 1': {
      threshold: 10,
      district: {ags: '00000', name: 'district1', type: 'type1'},
      compartment: 'Compartment 1',
    },
    '00000-Compartment 2': {
      threshold: 20,
      district: {ags: '00000', name: 'district1', type: 'type1'},
      compartment: 'Compartment 2',
    },
    '01001-Compartment 2': {
      threshold: 50,
      district: {ags: '01001', name: 'district2', type: 'type2'},
      compartment: 'Compartment 2',
    },
    '01001-Compartment 3': {
      threshold: 60,
      district: {ags: '01001', name: 'district2', type: 'type2'},
      compartment: 'Compartment 3',
    },
    '01059-Compartment 1': {
      threshold: 70,
      district: {ags: '01059', name: 'district3', type: 'type3'},
      compartment: 'Compartment 1',
    },
    '01059-Compartment 3': {
      threshold: 90,
      district: {ags: '01059', name: 'district3', type: 'type3'},
      compartment: 'Compartment 3',
    },
  };

  test('should render the HorizontalThresholdList TableBody with the correct number of rows', async () => {
    render(<HorizontalThresholdListTest />);
    expect(screen.getByTestId('horizontal-threshold-list')).toBeInTheDocument();

    await waitFor(() => {
      const tableLength = Object.entries(horizontalThresholds).length;
      const horizontalThresholdTable = screen.getByTestId('horizontal-table-body-testid');
      expect(horizontalThresholdTable.querySelectorAll('.MuiTableRow-root').length).toBe(tableLength);
    });
  });

  test('should render the table body with correct district, compartment, and threshold values', async () => {
    render(<HorizontalThresholdListTest />);

    await waitFor(() => {
      Object.entries(horizontalThresholds).forEach(([key, {district, compartment, threshold}]) => {
        // Get the row by the test id
        const thresholdRow = screen.getByTestId(`threshold-item-${key}`);

        // Check if the district name is present in the row
        expect(thresholdRow).toHaveTextContent(district.name);

        // Check if the compartment name is present in the row
        expect(thresholdRow).toHaveTextContent(compartment);

        // Check if the threshold value is present in the row
        expect(thresholdRow).toHaveTextContent(threshold.toString());
      });
    });
  });

  test('should render the HorizontalThresholdList with the correct number of rows including the add row and table header row', async () => {
    render(<HorizontalThresholdListTest />);

    await waitFor(() => {
      const totalLength = Object.entries(horizontalThresholds).length + 2;
      const horizontalThresholdList = screen.getByTestId('horizontal-threshold-list');
      expect(horizontalThresholdList).toBeInTheDocument();
      expect(horizontalThresholdList.querySelectorAll('.MuiTableRow-root').length).toBe(totalLength);
    });
  });

  test('render the add threshold button when adding', async () => {
    render(<HorizontalThresholdListTest />);
    expect(screen.getByTestId('horizontal-threshold-list')).toBeInTheDocument();

    const addThresholdButton = await screen.findByTestId('add-threshold-testid');
    expect(addThresholdButton).toBeInTheDocument();

    await userEvent.click(addThresholdButton);

    const addThresholdTableRow = await screen.findByTestId('add-threshold-table-row-testid');
    expect(addThresholdTableRow).toBeInTheDocument();
    expect(await screen.findByTestId('threshold-input-container-testid')).toBeInTheDocument();
  });

  test('disable the add threshold button when selected district and compartment already has a threshold', () => {
    render(
      <HorizontalThresholdListTest
        selectedCompartment='Compartment 1'
        selectedDistrict={{ags: '00000', name: 'district1', type: 'type1'}}
      />
    );
    expect(screen.getByTestId('horizontal-threshold-list')).toBeInTheDocument();

    const addThresholdButton = screen.getByTestId('add-threshold-button-testid');
    expect(addThresholdButton).toBeDisabled();
  });

  // similar to selectedThresholdKey

  test('should add threshold row and render it', async () => {
    render(<HorizontalThresholdListTest />);

    expect(screen.getByTestId('horizontal-threshold-list')).toBeInTheDocument();

    const addThresholdButton = screen.getByTestId('add-threshold-testid');
    expect(addThresholdButton).toBeInTheDocument();

    await userEvent.click(addThresholdButton);

    const addThresholdTableRow = await screen.findByTestId('add-threshold-table-row-testid');
    expect(addThresholdTableRow).toBeInTheDocument();
    expect(await screen.findByTestId('threshold-input-container-testid')).toBeInTheDocument();

    const thresholdInput = await screen.findByLabelText('Horizontal Threshold');
    expect(thresholdInput).toBeInTheDocument();

    await userEvent.clear(thresholdInput);
    await userEvent.type(thresholdInput, '12612');
    expect(screen.getByDisplayValue('12612')).toBeInTheDocument();

    const saveThresholdButton = screen.getByTestId('save-threshold');
    expect(saveThresholdButton).toBeInTheDocument();
    await userEvent.click(saveThresholdButton);

    await waitFor(() => {
      const horizontalThresholdTable = screen.getByTestId('horizontal-table-body-testid');
      expect(horizontalThresholdTable.querySelectorAll('.MuiTableRow-root').length).toBe(
        Object.entries(horizontalThresholds).length + 1
      );
    });

    // check whether the new threshold is added to the table
    const newThresholdRow = await screen.findByTestId('threshold-item-02000-Compartment 4');
    expect(newThresholdRow).toBeInTheDocument();
  });

  test('should handle error when adding a threshold that already exists', async () => {
    // Render the component with an existing threshold for the selected district and compartment
    render(
      <HorizontalThresholdListTest
        selectedDistrict={{ags: '00000', name: 'district1', type: 'type1'}}
        selectedCompartment='Compartment 1'
      />
    );

    // Attempt to add a new threshold which already exists
    const addThresholdButton = screen.getByTestId('add-threshold-testid');
    await userEvent.click(addThresholdButton);

    // setIsAddingThreshold(true) is not called
    expect(screen.queryByTestId('add-threshold-table-row-testid')).not.toBeInTheDocument();
  });
});
