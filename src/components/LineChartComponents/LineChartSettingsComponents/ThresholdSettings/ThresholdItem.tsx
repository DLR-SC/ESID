// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {useState} from 'react';
import {IconButton, Typography, Box, TableCell, TableRow} from '@mui/material';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import {useTheme} from '@mui/material/styles';
import {Threshold} from 'types/threshold';
import ThresholdInput from './ThresholdInput';

export interface ThresholdItemProps {
  /** The threshold item to display */
  threshold: Threshold;

  /** The key for the threshold (used for editing and updates) */
  thresholdKey: string;

  /** The function to remove a horizontal threshold. */
  removeThreshold: (id: string) => void;

  /** The function to update a horizontal threshold. */
  updateThreshold: (newThreshold: Threshold) => void;

  /** Callback to handle selection of a threshold */
  handleSelectThreshold: (threshold: Threshold) => void;

  /** The current edited key of the threshold */
  editingThresholdKey: string | null;

  /** Callback to set the current edited key of the threshold */
  setEditingThresholdKey: React.Dispatch<React.SetStateAction<string | null>>;

  /** The to determine whether threshold is selected */
  selected: boolean;

  /** Boolean to determine if the threshold is being edited */
  isEditingThreshold: boolean;

  /** The value of the threshold */
  thresholdValue: number;

  /** The name of the district */
  districtName: string;

  /** The name of the compartment */
  compartmentName: string | undefined;

  /** Boolean to determine if the threshold is being added */
  isAddingThreshold: boolean;

  /** testId for testing */
  testId?: string;
}

export default function ThresholdItem({
  threshold,
  thresholdKey,
  removeThreshold,
  updateThreshold,
  handleSelectThreshold,
  editingThresholdKey,
  setEditingThresholdKey,
  selected,
  isEditingThreshold,
  isAddingThreshold,
  districtName,
  compartmentName,
  thresholdValue,
  testId,
}: ThresholdItemProps) {
  const theme = useTheme();

  const [localThreshold, setLocalThreshold] = useState<number | null>(threshold.threshold);

  const isValid = localThreshold !== null && localThreshold > 0;

  const updateThresholdLocal = () => {
    if (localThreshold === null || localThreshold < 0) return;
    updateThreshold({...threshold, threshold: localThreshold});
    setEditingThresholdKey(null);
  };

  const handleEditThreshold = (key: string, threshold: number) => {
    setEditingThresholdKey(key);
    setLocalThreshold(threshold);
  };

  const isDisabled = (isEditingThreshold && editingThresholdKey !== thresholdKey) || isAddingThreshold;

  return (
    <TableRow
      className={selected ? 'selected-threshold' : ''}
      sx={{
        borderLeft: `2px ${selected ? theme.palette.primary.main : 'transparent'} solid`,
        transition: 'background-color 0.2s',
        ':hover': {
          backgroundColor: theme.palette.action.hover,
        },
        cursor: isDisabled ? 'not-allowed' : 'pointer',
      }}
      onClick={() => {
        if (!isDisabled) {
          handleSelectThreshold(threshold);
        }
      }}
      data-testid={testId}
    >
      <TableCell align='left'>
        <Typography
          variant='body1'
          sx={{
            fontSize: theme.typography.listElement.fontSize,
            color: isDisabled ? theme.palette.text.disabled : theme.palette.text.primary,
          }}
        >
          {districtName}
        </Typography>
      </TableCell>
      <TableCell align='left'>
        <Typography
          variant='body1'
          sx={{
            fontSize: theme.typography.listElement.fontSize,
            color: isDisabled ? theme.palette.text.disabled : theme.palette.text.primary,
          }}
        >
          {compartmentName}
        </Typography>
      </TableCell>

      {editingThresholdKey === thresholdKey ? (
        <TableCell>
          <ThresholdInput
            id='horizontal-y-threshold-input'
            value={localThreshold}
            error={!isValid}
            onChange={(e) => {
              const value = e.target.value === '' ? null : Number(e.target.value);
              setLocalThreshold(value);
            }}
            onSave={updateThresholdLocal}
            onCancel={() => setEditingThresholdKey(null)}
            isSaveDisabled={!isValid}
          />
        </TableCell>
      ) : (
        <>
          <TableCell
            align='left'
            sx={{
              minWidth: '250px',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
              }}
            >
              <Typography
                variant='body1'
                sx={{
                  fontSize: theme.typography.listElement.fontSize,
                  color: isDisabled ? theme.palette.text.disabled : theme.palette.text.primary,
                }}
              >
                {thresholdValue}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  gap: 2,
                }}
              >
                <IconButton
                  aria-label='edit horizontal threshold for given district and compartment'
                  data-testid={`edit-threshold-button-${thresholdKey}`}
                  onClick={() => handleEditThreshold(thresholdKey, threshold.threshold)}
                  disabled={isDisabled}
                >
                  <EditIcon
                    sx={{
                      color: isDisabled ? theme.palette.action.disabled : theme.palette.primary.main,
                    }}
                  />
                </IconButton>
                <IconButton
                  aria-label='delete Horizontal Y-threshold'
                  data-testid={`delete-threshold-button-${thresholdKey}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isDisabled) {
                      removeThreshold(thresholdKey);
                    }
                  }}
                  disabled={isDisabled}
                >
                  <DeleteForeverIcon
                    sx={{
                      color: isDisabled ? theme.palette.action.disabled : theme.palette.error.main,
                    }}
                  />
                </IconButton>
              </Box>
            </Box>
          </TableCell>
        </>
      )}
    </TableRow>
  );
}
