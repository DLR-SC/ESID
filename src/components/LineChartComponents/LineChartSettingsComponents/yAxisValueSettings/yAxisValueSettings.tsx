// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {useState} from 'react';
import Box from '@mui/material/Box';
import {Localization} from 'types/localization';
import {TextField, Typography, useTheme} from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import CheckIcon from '@mui/icons-material/Check';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';

interface YAxisValueSettingsProps {
  yAxisMaxValue: number | undefined;
  maxDataValue: number;
  updateYAxisMaxValue: (newYAxisMaxValue: number) => void;
  localization: Localization;
}

export default function YAxisValueSettings({
  yAxisMaxValue,
  maxDataValue,
  updateYAxisMaxValue,
  localization = {
    formatNumber: (value: number) => value.toString(),
    customLang: 'global',
    overrides: {},
  },
}: YAxisValueSettingsProps) {
  const theme = useTheme();
  const [localYAxisMaxValue, setLocalYAxisMaxValue] = useState<number | null>(yAxisMaxValue ?? maxDataValue);
  const [editing, setEditing] = useState<boolean>(false);
  const isValid = localYAxisMaxValue !== null && localYAxisMaxValue > 0;

  const getFormattedAndTranslatedValues = (filteredValues: number): string => {
    return localization.formatNumber ? localization.formatNumber(filteredValues) : filteredValues.toString();
  };

  const handleSave = () => {
    if (localYAxisMaxValue === null || localYAxisMaxValue < 0) return;
    console.log('localYAxisMaxValue', localYAxisMaxValue);
    updateYAxisMaxValue(localYAxisMaxValue);
    setEditing(false);
    console.log('UPDATE Y-AXIS MAX VALUE');
  };

  const handleCancel = () => {
    setEditing(false);
    setLocalYAxisMaxValue(yAxisMaxValue ?? maxDataValue);
  };

  const handleReset = () => {
    updateYAxisMaxValue(maxDataValue);
    setLocalYAxisMaxValue(maxDataValue);
  };

  return (
    <Box sx={{width: '100%', marginLeft: 4}}>
      {editing ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            gap: 1,
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant='h2' sx={{color: 'black'}}>
            Y-Axis Maximum
          </Typography>
          <Box sx={{display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center'}}>
            <TextField
              label='Y-Axis Max Value'
              id='y-axis-max-value'
              value={localYAxisMaxValue}
              placeholder={getFormattedAndTranslatedValues(yAxisMaxValue ?? maxDataValue)}
              error={!isValid}
              onChange={(e) => {
                const value = e.target.value === '' ? null : Number(e.target.value);
                setLocalYAxisMaxValue(value);
              }}
              size='small'
              variant='outlined'
            />
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                gap: 1,
              }}
            >
              <IconButton
                aria-label='add or edit Horizontal Threshold onto selected compartment and district'
                data-testid='save-threshold'
                onClick={(e) => {
                  e.stopPropagation();
                  handleSave();
                }}
                disabled={!isValid}
                sx={{color: theme.palette.success.main}}
              >
                <CheckIcon />
              </IconButton>
              <IconButton
                aria-label='cancel editing threshold'
                data-testid='cancel-threshold'
                onClick={(e) => {
                  e.stopPropagation();
                  handleCancel();
                }}
                sx={{color: theme.palette.error.main}}
              >
                <CancelIcon />
              </IconButton>
            </Box>
          </Box>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',

            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
            <Typography variant='h2' sx={{color: 'black'}}>
              Y-Axis Maximum
            </Typography>
            <Typography variant='caption' sx={{color: 'gray'}}>
              Global maximum value of the y-axis.
            </Typography>
          </Box>
          <Box sx={{display: 'flex', flexDirection: 'row', gap: 2, alignItems: 'center'}}>
            <Typography variant='h2' sx={{marginRight: '1rem'}}>
              {getFormattedAndTranslatedValues(yAxisMaxValue ?? maxDataValue)}
            </Typography>
            <Box sx={{display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center'}}>
              <Tooltip title='Edit Y-Axis Maximum'>
                <IconButton onClick={() => setEditing(true)}>
                  <EditIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title='Reset to current data maximum value'>
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReset();
                  }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
}
