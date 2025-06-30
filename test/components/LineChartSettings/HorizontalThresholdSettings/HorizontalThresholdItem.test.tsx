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
import {HorizontalThreshold} from 'types/horizontalThreshold';
import HorizontalThresholdItem from 'components/LineChartComponents/LineChartSettingsComponents/HorizontalThresholdSettings/HorizontalThresholdItem';

type HorizontalThresholdItemTestProps = {
  isAddingThreshold?: boolean;
};

const HorizontalThresholdItemTest: React.FC<HorizontalThresholdItemTestProps> = ({isAddingThreshold = false}) => {
  const [currentHorizontalThresholds, setCurrentHorizontalThresholds] = useState<Record<string, HorizontalThreshold>>({
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

  const [editingThresholdKey, setEditingThresholdKey] = useState<string | null>(null);
  const [selectedThresholdKey, setSelectedThresholdKey] = useState<string>('00000-Compartment 1');

  const handleSelectThreshold = (threshold: HorizontalThreshold) => {
    if (isAddingThreshold || editingThresholdKey !== null) {
      return;
    }
    setSelectedThresholdKey(threshold.district.nuts + '-' + threshold.compartment);
  };

  const removeHorizontalThreshold = (id: string) => {
    setCurrentHorizontalThresholds((prev) => {
      const newThresholds = {...prev};
      delete newThresholds[id];
      return newThresholds;
    });
  };

  const updateHorizontalThreshold = (newThreshold: HorizontalThreshold) => {
    const key = `${newThreshold.district.nuts}-${newThreshold.compartment}`;
    setCurrentHorizontalThresholds((prev) => ({
      ...prev,
      [key]: newThreshold,
    }));
  };

  return (
    <Provider store={Store}>
      <ThemeProvider theme={Theme}>
        <table>
          <tbody>
            {Object.entries(currentHorizontalThresholds ?? {}).map(([key, threshold]) => {
              return (
                <HorizontalThresholdItem
                  key={key}
                  threshold={threshold}
                  thresholdKey={key}
                  thresholdValue={threshold.threshold}
                  districtName={threshold.district.name}
                  compartmentName={threshold.compartment}
                  removeHorizontalThreshold={removeHorizontalThreshold}
                  updateHorizontalThreshold={updateHorizontalThreshold}
                  handleSelectThreshold={handleSelectThreshold}
                  editingThresholdKey={editingThresholdKey}
                  setEditingThresholdKey={setEditingThresholdKey}
                  selected={selectedThresholdKey === key}
                  isEditingThreshold={editingThresholdKey !== null}
                  isAddingThreshold={isAddingThreshold}
                  testId={`threshold-item-${key}`}
                />
              );
            })}
          </tbody>
        </table>
      </ThemeProvider>
    </Provider>
  );
};

describe('HorizontalThresholdItem Component', () => {
  test('correctly selects threshold item', async () => {
    render(<HorizontalThresholdItemTest />);

    // initial selected threshold item
    const initialThresholdItem = screen.getByTestId('threshold-item-00000-Compartment 1');
    expect(initialThresholdItem).toBeInTheDocument();
    expect(initialThresholdItem).toHaveClass('selected-threshold'); // Initially selected

    // Click on a different threshold item to select it
    const targetThresholdItem = screen.getByTestId('threshold-item-01001-Compartment 3');
    await userEvent.click(targetThresholdItem);

    // Verify that the new threshold is selected and no other threshold has 'selected-threshold' class
    expect(targetThresholdItem).toHaveClass('selected-threshold');
    expect(initialThresholdItem).not.toHaveClass('selected-threshold');
  });

  test('clicking on the edit button should show the textfield input', async () => {
    render(<HorizontalThresholdItemTest />);
    const editThresholdButton = screen.getByTestId('edit-threshold-button-01001-Compartment 3');
    expect(editThresholdButton).toBeInTheDocument();
    await userEvent.click(editThresholdButton);
    expect(await screen.findByTestId('threshold-input-testid')).toBeInTheDocument();
  });

  test('should edit a threshold', async () => {
    render(<HorizontalThresholdItemTest />);

    // Click on the threshold item
    const thresholdItem = screen.getByTestId('threshold-item-01001-Compartment 3');
    expect(thresholdItem).toBeInTheDocument();
    await userEvent.click(thresholdItem);

    // Click on the edit button
    const editThresholdButton = screen.getByTestId('edit-threshold-button-01001-Compartment 3');
    expect(editThresholdButton).toBeInTheDocument();
    expect(await screen.findByText('60')).toBeInTheDocument();
    await userEvent.click(editThresholdButton);

    const thresholdInput = await screen.findByLabelText('Horizontal Threshold');
    const saveButton = screen.getByTestId('save-threshold');
    expect(saveButton).toBeInTheDocument();
    expect(thresholdInput).toBeInTheDocument();
    await userEvent.clear(thresholdInput);
    await userEvent.type(thresholdInput, '68123');
    expect(screen.getByDisplayValue('68123')).toBeInTheDocument();
    await userEvent.click(saveButton);

    expect(await screen.findByTestId('threshold-item-01001-Compartment 3')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('68123')).toBeInTheDocument();
    });
  });

  test('edit a threshold with negative number input', async () => {
    render(<HorizontalThresholdItemTest />);

    // Click on the threshold item
    const thresholdItem = screen.getByTestId('threshold-item-01001-Compartment 3');
    expect(thresholdItem).toBeInTheDocument();
    await userEvent.click(thresholdItem);

    // Click on the edit button
    const editThresholdButton = screen.getByTestId('edit-threshold-button-00000-Compartment 1');
    expect(editThresholdButton).toBeInTheDocument();
    expect(await screen.findByText('10')).toBeInTheDocument();
    await userEvent.click(editThresholdButton);

    // Edit the threshold with a negative number
    const thresholdInput = await screen.findByLabelText('Horizontal Threshold');
    const saveButton = screen.getByTestId('save-threshold');
    expect(saveButton).toBeInTheDocument();
    expect(thresholdInput).toBeInTheDocument();
    await userEvent.clear(thresholdInput);
    await userEvent.type(thresholdInput, '-10');
    expect(screen.getByDisplayValue('-10')).toBeInTheDocument();
    // disabled save button
    expect(saveButton).toBeDisabled();

    // edit threshold with empty input
    await userEvent.clear(thresholdInput);
    expect(screen.getByDisplayValue('')).toBeInTheDocument();
    expect(saveButton).toBeDisabled();
  });

  test('should delete a threshold', async () => {
    render(<HorizontalThresholdItemTest />);

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

    // Verify other thresholds are still present
    expect(screen.getByTestId('threshold-item-00000-Compartment 1')).toBeInTheDocument();
    expect(screen.getByTestId('threshold-item-00000-Compartment 2')).toBeInTheDocument();
    expect(screen.getByTestId('threshold-item-01001-Compartment 1')).toBeInTheDocument();
    expect(screen.getByTestId('threshold-item-01059-Compartment 2')).toBeInTheDocument();
    expect(screen.getByTestId('threshold-item-01059-Compartment 3')).toBeInTheDocument();
  });

  test('should delete multiple thresholds', async () => {
    render(<HorizontalThresholdItemTest />);

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

    // Verify remaining thresholds
    expect(screen.getByTestId('threshold-item-00000-Compartment 2')).toBeInTheDocument();
    expect(screen.getByTestId('threshold-item-01001-Compartment 1')).toBeInTheDocument();
    expect(screen.getByTestId('threshold-item-01059-Compartment 2')).toBeInTheDocument();
    expect(screen.getByTestId('threshold-item-01059-Compartment 3')).toBeInTheDocument();
  });

  test('should not be able to delete when editing another threshold', async () => {
    render(<HorizontalThresholdItemTest />);

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

  test('should not be able to delete when adding a new threshold', () => {
    render(<HorizontalThresholdItemTest isAddingThreshold={true} />);

    // All delete buttons should be disabled when adding a threshold
    const deleteButtons = screen.getAllByTestId(/delete-threshold-button-/);
    deleteButtons.forEach((button) => {
      const buttonElement = button.closest('button');
      expect(buttonElement).toBeDisabled();
    });
  });
});
