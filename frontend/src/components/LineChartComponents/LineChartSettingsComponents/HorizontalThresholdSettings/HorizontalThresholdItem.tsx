// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {useState} from 'react';
import {IconButton, Typography, Box, TableCell, TableRow} from '@mui/material';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import {useTheme} from '@mui/material/styles';
import {HorizontalThreshold} from 'types/horizontalThreshold';
import ThresholdInput from './ThresholdInput';
import type {District} from 'types/district';
import type {Localization} from 'types/localization';
import {useTranslation} from 'react-i18next';

export interface HorizontalThresholdItemProps {
  /** The threshold item to display */
  threshold: HorizontalThreshold;

  /** The key for the threshold (used for editing and updates) */
  thresholdKey: string;

  /** Callback to handle the deletion of a threshold */
  handleDeleteThreshold: (district: District, compartment: string) => void;

  /** Callback to handle updating the threshold value */
  handleUpdateThreshold: (key: string, value: number) => void;

  /** Callback to handle selection of a threshold */
  handleSelectThreshold: (threshold: HorizontalThreshold) => void;

  /** The current edited key of the threshold */
  editingThresholdKey: string | null;

  /** Callback to set the current edited key of the threshold */
  setEditingThresholdKey: React.Dispatch<React.SetStateAction<string | null>>;

  /** The to determine whether threshold is selected */
  selected: boolean;

  /** Boolean to determine if the threshold is being edited */
  isEditingThreshold: boolean;

  /** Boolean to determine if the threshold is being added */
  isAddingThreshold: boolean;

  /** testId for testing */
  testId?: string;

  /** An object containing localization information (translation & number formattation). */
  localization?: Localization;
}

export default function HorizontalThresholdItem({
  threshold,
  thresholdKey,
  handleDeleteThreshold,
  handleUpdateThreshold,
  handleSelectThreshold,
  editingThresholdKey,
  setEditingThresholdKey,
  selected,
  isEditingThreshold,
  isAddingThreshold,
  testId,
  localization = {formatNumber: (value: number) => value.toString(), customLang: 'global', overrides: {}},
}: HorizontalThresholdItemProps) {
  const theme = useTheme();
  const {t: defaultT} = useTranslation();
  const {t: customT} = useTranslation(localization.customLang);

  // Get the translated compartment name
  const getTranslatedCompartmentName = (compartment: string): string => {
    const overrideKey = `compartments.${compartment}`;
    // Check if the translation exists in the overrides
    if (localization.overrides?.[overrideKey]) {
      return customT(localization.overrides[overrideKey]); // Translate using the custom namespace
    } else {
      return defaultT(compartment); // Fallback to the default compartment name if no translation is found
    }
  };

  const [localThreshold, setLocalThreshold] = useState<number | null>(threshold.threshold);

  const isValid = localThreshold !== null && localThreshold > 0;

  const updateThreshold = () => {
    if (localThreshold === null || localThreshold < 0) return;
    handleUpdateThreshold(thresholdKey, localThreshold);
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
          {threshold.district.name}
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
          {getTranslatedCompartmentName(threshold.compartment)}
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
            onSave={updateThreshold}
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
                {threshold.threshold}
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
                >
                  <EditIcon
                    sx={{
                      color: theme.palette.primary.main,
                    }}
                  />
                </IconButton>
                <IconButton
                  aria-label='delete Horizontal Y-threshold'
                  data-testid={`delete-threshold-button-${thresholdKey}`}
                  onClick={() => handleDeleteThreshold(threshold.district, threshold.compartment)}
                >
                  <DeleteForeverIcon />
                </IconButton>
              </Box>
            </Box>
          </TableCell>
        </>
      )}
    </TableRow>
  );
}
