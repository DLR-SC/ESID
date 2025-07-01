// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, test, expect} from 'vitest';
import React, {useState} from 'react';
import {ThemeProvider} from '@mui/system';
import Theme from 'util/Theme';
import {Provider} from 'react-redux';
import {Store} from 'store';
import {District} from 'types/district';
import {Threshold} from 'types/threshold';
import ThresholdList from 'components/LineChartComponents/LineChartSettingsComponents/ThresholdSettings/ThresholdList';

type ThresholdListTestProps = {
  selectedDistrict?: District;
  selectedCompartment?: string;
};

const ThresholdListTest: React.FC<ThresholdListTestProps> = ({
  selectedDistrict = {id: '1', nuts: '02000', name: 'district4', type: 'type4'},
  selectedCompartment = 'Compartment 4',
}) => {
  const [thresholds, setThresholds] = useState<Record<string, Threshold>>({
    '00000-Compartment 1': {
      threshold: 10,
      district: {id: '1', nuts: '00000', name: 'district1', type: 'type1'},
      compartment: 'Compartment 1',
    },
    '00000-Compartment 2': {
      threshold: 20,
      district: {id: '1', nuts: '00000', name: 'district1', type: 'type1'},
      compartment: 'Compartment 2',
    },
    '01001-Compartment 1': {
      threshold: 40,
      district: {id: '2', nuts: '01001', name: 'district2', type: 'type2'},
      compartment: 'Compartment 1',
    },
    '01001-Compartment 3': {
      threshold: 60,
      district: {id: '2', nuts: '01001', name: 'district2', type: 'type2'},
      compartment: 'Compartment 3',
    },
    '01059-Compartment 2': {
      threshold: 80,
      district: {id: '3', nuts: '01059', name: 'district3', type: 'type3'},
      compartment: 'Compartment 2',
    },
    '01059-Compartment 3': {
      threshold: 90,
      district: {id: '3', nuts: '01059', name: 'district3', type: 'type3'},
      compartment: 'Compartment 3',
    },
  });

  const removeThreshold = (id: string) => {
    setThresholds((prev) => {
      const newThresholds = {...prev};
      delete newThresholds[id];
      return newThresholds;
    });
  };

  const updateThreshold = (newThreshold: Threshold) => {
    const key = `${newThreshold.district.nuts}-${newThreshold.compartment}`;
    setThresholds((prev) => ({
      ...prev,
      [key]: newThreshold,
    }));
  };

  return (
    <div data-testid='horizontal-threshold-list'>
      <Provider store={Store}>
        <ThemeProvider theme={Theme}>
          <ThresholdList
            thresholds={thresholds}
            removeThreshold={removeThreshold}
            updateThreshold={updateThreshold}
            compartments={[
              {id: 'Compartment 1', name: 'Compartment 1'},
              {id: 'Compartment 2', name: 'Compartment 2'},
              {id: 'Compartment 3', name: 'Compartment 3'},
              {id: 'Compartment 4', name: 'Compartment 4'},
            ]}
            selectedDistrict={selectedDistrict}
            selectedCompartment={selectedCompartment}
          />
        </ThemeProvider>
      </Provider>
    </div>
  );
};

describe('ThresholdSettingsList Component', () => {
  test('should render the ThresholdList', () => {
    render(<ThresholdListTest />);
    const thresholdList = screen.getByTestId('horizontal-threshold-list');
    expect(thresholdList).toBeInTheDocument();
  });

  const initialThresholds: Record<string, Threshold> = {
    '00000-Compartment 1': {
      threshold: 10,
      district: {id: '1', nuts: '00000', name: 'district1', type: 'type1'},
      compartment: 'Compartment 1',
    },
    '00000-Compartment 2': {
      threshold: 20,
      district: {id: '1', nuts: '00000', name: 'district1', type: 'type1'},
      compartment: 'Compartment 2',
    },
    '01001-Compartment 1': {
      threshold: 40,
      district: {id: '2', nuts: '01001', name: 'district2', type: 'type2'},
      compartment: 'Compartment 1',
    },
    '01001-Compartment 3': {
      threshold: 60,
      district: {id: '2', nuts: '01001', name: 'district2', type: 'type2'},
      compartment: 'Compartment 3',
    },
    '01059-Compartment 2': {
      threshold: 80,
      district: {id: '3', nuts: '01059', name: 'district3', type: 'type3'},
      compartment: 'Compartment 2',
    },
    '01059-Compartment 3': {
      threshold: 90,
      district: {id: '3', nuts: '01059', name: 'district3', type: 'type3'},
      compartment: 'Compartment 3',
    },
  };

  test('should render the ThresholdList TableBody with the correct number of rows', async () => {
    render(<ThresholdListTest />);
    expect(screen.getByTestId('horizontal-threshold-list')).toBeInTheDocument();

    await waitFor(() => {
      const tableLength = Object.entries(initialThresholds).length;
      const thresholdTable = screen.getByTestId('horizontal-table-body-testid');
      expect(thresholdTable.querySelectorAll('.MuiTableRow-root').length).toBe(tableLength);
    });
  });

  test('should render the table body with correct district, compartment, and threshold values', async () => {
    render(<ThresholdListTest />);

    await waitFor(() => {
      Object.entries(initialThresholds).forEach(([key, {district, compartment, threshold}]) => {
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

  test('should render the ThresholdList with the correct number of rows including the add row and table header row', async () => {
    render(<ThresholdListTest />);

    await waitFor(() => {
      const totalLength = Object.entries(initialThresholds).length + 2;
      const thresholdList = screen.getByTestId('horizontal-threshold-list');
      expect(thresholdList).toBeInTheDocument();
      expect(thresholdList.querySelectorAll('.MuiTableRow-root').length).toBe(totalLength);
    });
  });

  test('render the add threshold button when adding', async () => {
    render(<ThresholdListTest />);
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
      <ThresholdListTest
        selectedCompartment='Compartment 1'
        selectedDistrict={{id: '1', nuts: '00000', name: 'district1', type: 'type1'}}
      />
    );
    expect(screen.getByTestId('horizontal-threshold-list')).toBeInTheDocument();

    const addThresholdButton = screen.getByTestId('add-threshold-button-testid');
    expect(addThresholdButton).toBeDisabled();
  });

  test('should add threshold row and render it', async () => {
    render(<ThresholdListTest />);

    expect(screen.getByTestId('horizontal-threshold-list')).toBeInTheDocument();

    const addThresholdButton = screen.getByTestId('add-threshold-testid');
    expect(addThresholdButton).toBeInTheDocument();

    await userEvent.click(addThresholdButton);

    const addThresholdTableRow = await screen.findByTestId('add-threshold-table-row-testid');
    expect(addThresholdTableRow).toBeInTheDocument();
    expect(await screen.findByTestId('threshold-input-container-testid')).toBeInTheDocument();

    const thresholdInput = await screen.findByLabelText('thresholds.threshold');
    expect(thresholdInput).toBeInTheDocument();

    await userEvent.clear(thresholdInput);
    await userEvent.type(thresholdInput, '12612');
    expect(screen.getByDisplayValue('12612')).toBeInTheDocument();

    const saveThresholdButton = screen.getByTestId('save-threshold');
    expect(saveThresholdButton).toBeInTheDocument();
    await userEvent.click(saveThresholdButton);

    await waitFor(() => {
      const thresholdTable = screen.getByTestId('horizontal-table-body-testid');
      expect(thresholdTable.querySelectorAll('.MuiTableRow-root').length).toBe(
        Object.entries(initialThresholds).length + 1
      );
    });

    // check whether the new threshold is added to the table
    const newThresholdRow = await screen.findByTestId('threshold-item-02000-Compartment 4');
    expect(newThresholdRow).toBeInTheDocument();
  });

  test('should handle error when adding a threshold that already exists', async () => {
    // Render the component with an existing threshold for the selected district and compartment
    render(
      <ThresholdListTest
        selectedDistrict={{id: '1', nuts: '00000', name: 'district1', type: 'type1'}}
        selectedCompartment='Compartment 1'
      />
    );

    // Attempt to add a new threshold which already exists
    const addThresholdButton = screen.getByTestId('add-threshold-testid');
    await userEvent.click(addThresholdButton);

    // setIsAddingThreshold(true) is not called
    expect(screen.queryByTestId('add-threshold-table-row-testid')).not.toBeInTheDocument();
  });

  test('should delete a threshold from the list', async () => {
    render(<ThresholdListTest />);

    // Verify the threshold exists initially
    const thresholdItem = screen.getByTestId('threshold-item-01001-Compartment 3');
    expect(thresholdItem).toBeInTheDocument();
    await userEvent.click(thresholdItem);

    // Click on the delete button
    const deleteThresholdButton = screen.getByTestId('delete-threshold-button-01001-Compartment 3');
    expect(deleteThresholdButton).toBeInTheDocument();
    await userEvent.click(deleteThresholdButton);

    // Verify the threshold is removed from the DOM
    await waitFor(() => {
      expect(screen.queryByTestId('threshold-item-01001-Compartment 3')).not.toBeInTheDocument();
    });

    // Verify the table has one less row
    const thresholdTable = screen.getByTestId('horizontal-table-body-testid');
    expect(thresholdTable.querySelectorAll('.MuiTableRow-root').length).toBe(
      Object.entries(initialThresholds).length - 1
    );

    // Verify other thresholds are still present
    expect(screen.getByTestId('threshold-item-00000-Compartment 1')).toBeInTheDocument();
    expect(screen.getByTestId('threshold-item-00000-Compartment 2')).toBeInTheDocument();
    expect(screen.getByTestId('threshold-item-01001-Compartment 1')).toBeInTheDocument();
    expect(screen.getByTestId('threshold-item-01059-Compartment 2')).toBeInTheDocument();
    expect(screen.getByTestId('threshold-item-01059-Compartment 3')).toBeInTheDocument();
  });

  test('should delete multiple thresholds from the list', async () => {
    render(<ThresholdListTest />);

    // Delete first threshold
    const firstThresholdItem = screen.getByTestId('threshold-item-00000-Compartment 1');
    expect(firstThresholdItem).toBeInTheDocument();
    await userEvent.click(firstThresholdItem);

    const firstDeleteButton = screen.getByTestId('delete-threshold-button-00000-Compartment 1');
    await userEvent.click(firstDeleteButton);

    await waitFor(() => {
      expect(screen.queryByTestId('threshold-item-00000-Compartment 1')).not.toBeInTheDocument();
    });

    // Delete second threshold
    const secondThresholdItem = screen.getByTestId('threshold-item-01001-Compartment 3');
    expect(secondThresholdItem).toBeInTheDocument();
    await userEvent.click(secondThresholdItem);

    const secondDeleteButton = screen.getByTestId('delete-threshold-button-01001-Compartment 3');
    await userEvent.click(secondDeleteButton);

    await waitFor(() => {
      expect(screen.queryByTestId('threshold-item-01001-Compartment 3')).not.toBeInTheDocument();
    });

    // Verify the table has two less rows
    const thresholdTable = screen.getByTestId('horizontal-table-body-testid');
    expect(thresholdTable.querySelectorAll('.MuiTableRow-root').length).toBe(
      Object.entries(initialThresholds).length - 2
    );

    // Verify remaining thresholds are still present
    expect(screen.getByTestId('threshold-item-00000-Compartment 2')).toBeInTheDocument();
    expect(screen.getByTestId('threshold-item-01001-Compartment 1')).toBeInTheDocument();
    expect(screen.getByTestId('threshold-item-01059-Compartment 2')).toBeInTheDocument();
    expect(screen.getByTestId('threshold-item-01059-Compartment 3')).toBeInTheDocument();
  });

  test('should update a threshold in the list', async () => {
    render(<ThresholdListTest />);

    // Click on the threshold item to select it
    const thresholdItem = screen.getByTestId('threshold-item-01001-Compartment 3');
    expect(thresholdItem).toBeInTheDocument();
    await userEvent.click(thresholdItem);

    // Click on the edit button
    const editThresholdButton = screen.getByTestId('edit-threshold-button-01001-Compartment 3');
    expect(editThresholdButton).toBeInTheDocument();
    await userEvent.click(editThresholdButton);

    // Edit the threshold value
    const thresholdInput = await screen.findByLabelText('thresholds.threshold');
    expect(thresholdInput).toBeInTheDocument();
    await userEvent.clear(thresholdInput);
    await userEvent.type(thresholdInput, '999');
    expect(screen.getByDisplayValue('999')).toBeInTheDocument();

    // Save the changes
    const saveButton = screen.getByTestId('save-threshold');
    expect(saveButton).toBeInTheDocument();
    await userEvent.click(saveButton);

    // Verify the updated value is displayed
    await waitFor(() => {
      expect(screen.queryByText('999')).toBeInTheDocument();
    });

    // Verify the threshold item still exists
    expect(screen.getByTestId('threshold-item-01001-Compartment 3')).toBeInTheDocument();
  });

  test('should not be able to delete when editing a threshold', async () => {
    render(<ThresholdListTest />);

    // Start editing one threshold
    const editThresholdButton = screen.getByTestId('edit-threshold-button-00000-Compartment 1');
    await userEvent.click(editThresholdButton);

    // Try to delete another threshold - it should be disabled
    const deleteThresholdButton = screen.getByTestId('delete-threshold-button-01001-Compartment 3');
    expect(deleteThresholdButton).toBeInTheDocument();

    // The delete button should be disabled when editing
    const deleteButton = deleteThresholdButton.closest('button');
    expect(deleteButton).toBeDisabled();
  });

  test('should not be able to delete when adding a new threshold', async () => {
    render(<ThresholdListTest />);

    // Start adding a new threshold
    const addThresholdButton = screen.getByTestId('add-threshold-testid');
    await userEvent.click(addThresholdButton);

    // All delete buttons should be disabled when adding a threshold
    const deleteButtons = screen.getAllByTestId(/delete-threshold-button-/);
    deleteButtons.forEach((button) => {
      const buttonElement = button.closest('button');
      expect(buttonElement).toBeDisabled();
    });
  });
});
