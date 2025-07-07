import React, {useState} from 'react';
import Box from '@mui/material/Box';
import {District} from 'types/district';
import {TextField, useTheme} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import CheckIcon from '@mui/icons-material/Check';
import CancelIcon from '@mui/icons-material/Cancel';

interface YAxisValueSettingsProps {
  selectedDistrict: District;
  selectedCompartment: string;
  yAxisMaxValue: number;
  updateYAxisMaxValue: (newYAxisMaxValue: number) => void;
}

export default function YAxisValueSettings({yAxisMaxValue, updateYAxisMaxValue}: YAxisValueSettingsProps) {
  const theme = useTheme();
  const [localYAxisMaxValue, setLocalYAxisMaxValue] = useState<number | null>(yAxisMaxValue);
  const [, setEditingYAxisMaxValue] = useState<boolean>(false);
  const isValid = localYAxisMaxValue !== null && localYAxisMaxValue > 0;

  return (
    <Box>
      <TextField
        label='Y-Axis Max Value'
        id='y-axis-max-value'
        value={localYAxisMaxValue}
        error={!isValid}
        onChange={(e) => {
          const value = e.target.value === '' ? null : Number(e.target.value);
          setLocalYAxisMaxValue(value);
        }}
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
          onClick={() => {
            if (localYAxisMaxValue === null || localYAxisMaxValue < 0) return;
            console.log('localYAxisMaxValue', localYAxisMaxValue);
            updateYAxisMaxValue(localYAxisMaxValue);
            setEditingYAxisMaxValue(false);
            console.log('UPDATE Y-AXIS MAX VALUE');
          }}
          disabled={!isValid}
          sx={{color: theme.palette.success.main}}
        >
          <CheckIcon />
        </IconButton>
        <IconButton
          aria-label='cancel editing threshold'
          data-testid='cancel-threshold'
          onClick={() => {
            setEditingYAxisMaxValue(false);
          }}
          sx={{color: theme.palette.error.main}}
        >
          <CancelIcon />
        </IconButton>
      </Box>
    </Box>
  );
}
