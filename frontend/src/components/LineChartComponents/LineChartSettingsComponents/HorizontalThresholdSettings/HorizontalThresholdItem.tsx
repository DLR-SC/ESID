// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {useState} from 'react';
import {IconButton, Typography, Divider, Box} from '@mui/material';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import {useTheme} from '@mui/material/styles';
import {HorizontalThreshold} from 'types/horizontalThreshold';
import ThresholdInput from './ThresholdInput';
import type {District} from 'types/district';

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

  /** Current edited key of the threshold */
  editingThresholdKey: string | null;

  /** Callback to set the current edited key of the threshold */
  setEditingThresholdKey: React.Dispatch<React.SetStateAction<string | null>>;

  /** The to determine whether threshold is selected */
  selected: boolean;
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
}: HorizontalThresholdItemProps) {
  const [localThreshold, setLocalThreshold] = useState<number>(threshold.threshold);
  const theme = useTheme();
  const isValid = localThreshold !== null && localThreshold > 0;

  const updateThreshold = () => {
    if (localThreshold < 0) return;
    handleUpdateThreshold(thresholdKey, localThreshold);
    setEditingThresholdKey(null);
  };

  const handleEditThreshold = (key: string, threshold: number) => {
    setEditingThresholdKey(key);
    setLocalThreshold(threshold);
  };

  return (
    <React.Fragment>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 4,
          paddingY: 3,
          paddingX: 3,
          borderLeft: `2px ${selected ? theme.palette.primary.main : 'transparent'} solid`,
          borderTop: `2px ${selected ? theme.palette.background.paper : 'transparent'} solid`,
          borderBottom: `2px ${selected ? theme.palette.background.paper : 'transparent'} solid`,
          ':hover': {
            backgroundColor: theme.palette.action.hover,
          },
        }}
        onClick={() => handleSelectThreshold(threshold)}
      >
        <Box
          sx={{
            flexGrow: 1,
            minWidth: '150px',
          }}
        >
          <Typography
            variant='h2'
            sx={{
              color: selected ? theme.palette.text.primary : theme.palette.text.disabled,
            }}
          >
            {threshold.district.name}
          </Typography>
          <Typography
            variant='subtitle1'
            sx={{
              color: selected ? theme.palette.text.primary : theme.palette.text.disabled,
            }}
          >
            {threshold.compartment}
          </Typography>
        </Box>

        {editingThresholdKey === thresholdKey ? (
          <ThresholdInput
            id='horizontal-y-threshold-input'
            value={localThreshold}
            error={!isValid}
            onChange={(e) => setLocalThreshold(Number(e.target.value))}
            onSave={updateThreshold}
            onCancel={() => setEditingThresholdKey(null)}
            isSaveDisabled={!isValid}
          />
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Divider orientation='vertical' flexItem />
            <Box
              sx={{
                minWidth: '100px',
              }}
            >
              <Typography
                variant='h2'
                sx={{
                  color: selected ? theme.palette.text.primary : theme.palette.text.disabled,
                }}
              >
                {threshold.threshold}
              </Typography>
            </Box>

            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                gap: 2,
              }}
            >
              <IconButton
                aria-label='edit horizontal threshold for given district and compartment'
                onClick={() => handleEditThreshold(thresholdKey, threshold.threshold)}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                aria-label='delete Horizontal Y-threshold'
                onClick={() => handleDeleteThreshold(threshold.district, threshold.compartment)}
              >
                <DeleteForeverIcon />
              </IconButton>
            </Box>
          </Box>
        )}
      </Box>
      <Divider
        sx={{
          marginY: 2,
        }}
      />
    </React.Fragment>
  );
}
