// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {useState} from 'react';
import Box from '@mui/material/Box';
import {Localization} from 'types/localization';
import {Button, useTheme} from '@mui/material';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Snackbar from '@mui/material/Snackbar';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import CheckIcon from '@mui/icons-material/Check';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
import Divider from '@mui/material/Divider';
import Portal from '@mui/material/Portal';
import Alert from '@mui/material/Alert';
import {useTranslation} from 'react-i18next';
interface YAxisValueSettingsProps {
  /** The maximum value for the Y-axis */
  yAxisMaxValue: number | undefined;

  /** The actual maximum value of the currently displayed data on the chart*/
  maxDataValue: number;

  /** The function to update the Y-axis maximum value */
  updateYAxisMaxValue: (newYAxisMaxValue: number | undefined) => void;

  /** The localization object */
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
  const {t} = useTranslation('settings');
  const [localYAxisMaxValue, setLocalYAxisMaxValue] = useState<number | null>(yAxisMaxValue ?? maxDataValue);
  const [editing, setEditing] = useState<boolean>(false);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'info' | 'warning' | 'error'>('info');
  const [errors, setErrors] = useState<string[]>([]);

  const getFormattedAndTranslatedValues = (filteredValues: number): string => {
    return localization.formatNumber ? localization.formatNumber(filteredValues) : filteredValues.toString();
  };

  const validateInput = (newYValue: number | null): boolean => {
    const errors: string[] = [];
    if (newYValue === null || newYValue < 0) {
      errors.push(t('y-axis-settings.validation.positiveNumber'));
    }

    setErrors(errors);
    return errors.length === 0;
  };

  const handleSnackbarOpen = (message: string, severity: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSave = (newYValue: number | null) => {
    if (newYValue === null) {
      updateYAxisMaxValue(maxDataValue);
      setLocalYAxisMaxValue(maxDataValue);
      setEditing(false);
      return;
    }

    if (validateInput(newYValue)) {
      if (newYValue === yAxisMaxValue) {
        setEditing(false);
        return;
      }

      updateYAxisMaxValue(newYValue);
      setLocalYAxisMaxValue(newYValue);
      setEditing(false);
      handleSnackbarOpen(t('y-axis-settings.messages.success'), 'success');
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setLocalYAxisMaxValue(yAxisMaxValue ?? maxDataValue);
  };

  const handleReset = () => {
    updateYAxisMaxValue(undefined);
    setLocalYAxisMaxValue(maxDataValue);
  };

  return (
    <Box
      sx={{
        width: '100%',
        marginLeft: 4,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
      }}
    >
      <Portal>
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={4000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{vertical: 'bottom', horizontal: 'left'}}
        >
          <Alert severity={snackbarSeverity}>{snackbarMessage}</Alert>
        </Snackbar>
      </Portal>
      <Box sx={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2}}>
        <Typography
          variant='h2'
          sx={{
            color: theme.palette.primary.main,
            textTransform: 'uppercase',
            paddingRight: 2,
          }}
        >
          {t('y-axis-settings.title')}
        </Typography>
      </Box>
      <Divider orientation='vertical' flexItem />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          gap: 1,
          flex: 1,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {editing ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              gap: 3,
              alignItems: 'center',
              width: '100%',
              justifyContent: 'space-between',
            }}
          >
            <TextField
              id='y-axis-max-value'
              value={localYAxisMaxValue}
              placeholder={getFormattedAndTranslatedValues(yAxisMaxValue ?? maxDataValue)}
              error={errors.length > 0}
              helperText={errors.join(', ')}
              onChange={(e) => {
                setErrors([]);
                const value = e.target.value === '' ? null : Number(e.target.value);
                setLocalYAxisMaxValue(value);
              }}
              size='small'
              variant='outlined'
              sx={{width: '100%'}}
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
                  handleSave(localYAxisMaxValue);
                }}
                disabled={errors.length > 0}
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
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              gap: 3,
              alignItems: 'center',
              width: '100%',
              justifyContent: 'space-between',
            }}
          >
            <Button
              variant='text'
              onClick={() => setEditing(true)}
              sx={{
                cursor: 'text',
              }}
            >
              <Typography
                variant='body1'
                sx={{
                  color: 'black',
                }}
              >
                {getFormattedAndTranslatedValues(yAxisMaxValue ?? maxDataValue)}
              </Typography>
            </Button>
            <Box sx={{display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center'}}>
              <Tooltip title={t('y-axis-settings.editTooltip')}>
                <IconButton onClick={() => setEditing(true)}>
                  <EditIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('y-axis-settings.resetTooltip')}>
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReset();
                  }}
                  disabled={localYAxisMaxValue === maxDataValue}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
