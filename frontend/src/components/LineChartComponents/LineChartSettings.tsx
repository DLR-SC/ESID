// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import SettingsIcon from '@mui/icons-material/Settings';
import {Button, Grid, Popover, Typography} from '@mui/material';
import Box from '@mui/material/Box';
import {useAppSelector, useAppDispatch} from '../../store/hooks';
import {setHorizontalYAxisThreshold} from '../../store/UserPreferenceSlice';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import TextField from '@mui/material/TextField';

import React, {useState} from 'react';

export function LineChartSettings() {
  const dispatch = useAppDispatch();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showPopover, setShowPopover] = useState<boolean>(false);

  const horizontalYAxisThreshold = useAppSelector((state) => state.userPreference.horizontalYAxisThreshold);

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setShowPopover(true);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
    setShowPopover(false);
  };

  const handleThresholdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newThreshold = Number(event.target.value);

    // update redux state
    dispatch(setHorizontalYAxisThreshold(newThreshold));
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        zIndex: 1000,
      }}
    >
      <Button onClick={handlePopoverOpen}>
        <SettingsIcon />
      </Button>
      <Popover
        aria-label='line-chart-settings'
        anchorEl={anchorEl}
        open={showPopover}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box p={4}>
          <IconButton
            aria-label='close'
            test-id='close-info-button'
            onClick={handlePopoverClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon data-testid='close-info-button' />
          </IconButton>
          <Typography variant='h1'>Chart Settings</Typography>
          <Grid container alignItems={'center'} gap={4}>
            <Grid>
              <Typography variant='h2'>Horizontal Y-Threshold</Typography>
            </Grid>
            <Grid>
              <TextField
                id='horizontal-y-threshold-input'
                label='Horizontal Y-Threshold'
                type='number'
                variant='filled'
                value={horizontalYAxisThreshold || undefined}
                onChange={handleThresholdChange}
              />
            </Grid>
          </Grid>
        </Box>
      </Popover>
    </Box>
  );
}
