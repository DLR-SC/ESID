// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import {Box, TextField, IconButton} from '@mui/material';
import {useTheme} from '@mui/material/styles';
import CheckIcon from '@mui/icons-material/Check';
import CancelIcon from '@mui/icons-material/Cancel';
import {useTranslation} from 'react-i18next';

interface ThresholdInputProps {
  id: string;
  value: number | null;
  error: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaveDisabled: boolean;
}

export default function ThresholdInput({
  id,
  value,
  error,
  onChange,
  onSave,
  onCancel,
  isSaveDisabled,
}: ThresholdInputProps) {
  const theme = useTheme();
  const {t} = useTranslation('settings');
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        gap: 4,
        alignItems: 'center',
      }}
    >
      <TextField
        id={id}
        label={t('thresholds.threshold')}
        data-testid='threshold-input-testid'
        type='number'
        variant='outlined'
        value={value ?? ''}
        margin='none'
        error={error}
        onChange={onChange}
        size='small'
      />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          gap: 1,
        }}
      >
        <IconButton
          aria-label='add or edit Threshold onto selected compartment and district'
          data-testid='save-threshold'
          onClick={onSave}
          disabled={isSaveDisabled}
          sx={{color: theme.palette.success.main}}
        >
          <CheckIcon />
        </IconButton>
        <IconButton
          aria-label='cancel editing threshold'
          data-testid='cancel-threshold'
          onClick={onCancel}
          sx={{color: theme.palette.error.main}}
        >
          <CancelIcon />
        </IconButton>
      </Box>
    </Box>
  );
}
