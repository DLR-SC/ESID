// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: CC0-1.0

import React, {useState} from 'react';
import {Grid, IconButton, TextField, Typography, Divider, Box} from '@mui/material';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CancelIcon from '@mui/icons-material/Cancel';
import {useTheme} from '@mui/material/styles';
import {HorizontalThreshold} from 'types/horizontalThreshold';
import {Dictionary} from 'util/util';
import type {District} from 'types/district';

export interface HorizontalThresholdListProps {
  /** The list of horizontal thresholds to display */
  horizontalThresholds: Dictionary<HorizontalThreshold>;

  /** Callback to handle the deletion of a threshold */
  handleDeleteThreshold: (district: District, compartment: string) => void;

  /** Callback to handle changes to an existing threshold value */
  handleUpdateThreshold: (key: string, value: number) => void;

  /** Current edited key of the threshold */
  editingThresholdKey: string | null;

  /** Callback to set the current edited key of the threshold */
  setEditingThresholdKey: React.Dispatch<React.SetStateAction<string | null>>;

  /** A boolean state to see whether a threshold is currently being added */
  isAddingThreshold: boolean;
}

export const HorizontalThresholdList = ({
  horizontalThresholds,
  handleDeleteThreshold,
  handleUpdateThreshold,
  editingThresholdKey,
  setEditingThresholdKey,
  isAddingThreshold,
}: HorizontalThresholdListProps) => {
  const [localThreshold, setLocalThreshold] = useState<number>(0);
  const theme = useTheme();

  const handleEditThreshold = (key: string, threshold: number) => {
    setEditingThresholdKey(key);
    setLocalThreshold(threshold);
  };

  const updateThreshold = (key: string, newThresholdValue: number | null) => {
    if (newThresholdValue === null || newThresholdValue < 0) {
      return;
    }
    handleUpdateThreshold(key, newThresholdValue);
    setEditingThresholdKey(null);
  };

  return (
    <Box>
      {Object.entries(horizontalThresholds ?? {}).length === 0 && !isAddingThreshold ? (
        <Box
          sx={{
            paddingY: 2,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Typography variant='h2'>No thresholds set</Typography>
        </Box>
      ) : (
        Object.entries(horizontalThresholds ?? {}).map(([key, threshold]) => (
          <React.Fragment key={key}>
            <Grid
              sx={{
                width: '100%',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Box>
                <Typography variant='h2'>{threshold.district.name}</Typography>
                <Typography variant='subtitle1'>{threshold.compartment}</Typography>
              </Box>
              <Divider
                orientation='vertical'
                variant='middle'
                flexItem
                sx={{
                  marginY: 0,
                  paddingY: 0,
                }}
              />

              {editingThresholdKey === key ? (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 4,
                    width: '100%',
                  }}
                >
                  <TextField
                    type='number'
                    variant='filled'
                    label='Threshold'
                    value={localThreshold}
                    size='small'
                    onChange={(e) => setLocalThreshold(Number(e.target.value))}
                  />
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      gap: 1,
                    }}
                  >
                    <IconButton
                      aria-label='update Horizontal Y-threshold'
                      size='large'
                      onClick={() => updateThreshold(key, localThreshold)}
                    >
                      <CheckIcon />
                    </IconButton>
                    <IconButton
                      aria-label='cancel update Horizontal Y-threshold'
                      size='large'
                      onClick={() => setEditingThresholdKey(null)}
                      sx={{
                        color: theme.palette.error.main,
                      }}
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
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 4,
                    width: '100%',
                  }}
                >
                  <Typography variant='h2'>Threshold: {threshold.threshold}</Typography>
                  <Box>
                    <IconButton onClick={() => handleEditThreshold(key, threshold.threshold)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      aria-label='delete Horizontal Y-threshold'
                      size='large'
                      onClick={() => handleDeleteThreshold(threshold.district, threshold.compartment)}
                    >
                      <DeleteForeverIcon />
                    </IconButton>
                  </Box>
                </Box>
              )}
            </Grid>
            <Divider
              sx={{
                marginY: 2,
              }}
            />
          </React.Fragment>
        ))
      )}
    </Box>
  );
};
