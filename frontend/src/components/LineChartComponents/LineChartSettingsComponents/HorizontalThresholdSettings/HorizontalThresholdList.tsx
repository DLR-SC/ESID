// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {useState} from 'react';
import {Box, Typography} from '@mui/material';
import {Dictionary} from 'util/util';
import {HorizontalThreshold} from 'types/horizontalThreshold';
import type {District} from 'types/district';
import HorizontalThresholdItem from './HorizontalThresholdItem';

export interface HorizontalThresholdListProps {
  /** The list of horizontal thresholds to display */
  horizontalThresholds: Dictionary<HorizontalThreshold>;

  /** Callback to handle the deletion of a threshold */
  handleDeleteThreshold: (district: District, compartment: string) => void;

  /** Callback to handle changes to an existing threshold value */
  handleUpdateThreshold: (key: string, value: number) => void;

  /** Callback to handle selection of thresholds */
  handleSelectThreshold: (threshold: HorizontalThreshold) => void;

  /** A boolean state to see whether a threshold is currently being added */
  isAddingThreshold: boolean;

  /** The selected District */
  selectedDistrict: District;

  /** The selected compartment */
  selectedCompartment: string;

  /** The currently selected threshold key */
  selectedThresholdKey: string | null;
}

export default function HorizontalThresholdList({
  horizontalThresholds,
  handleDeleteThreshold,
  handleUpdateThreshold,
  handleSelectThreshold,
  isAddingThreshold,
  selectedThresholdKey,
}: HorizontalThresholdListProps) {
  const [editingThresholdKey, setEditingThresholdKey] = useState<string | null>(null);

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
        Object.entries(horizontalThresholds ?? {}).map(([key, threshold]) => {
          return (
            <HorizontalThresholdItem
              key={key}
              threshold={threshold}
              thresholdKey={key}
              handleDeleteThreshold={handleDeleteThreshold}
              handleUpdateThreshold={handleUpdateThreshold}
              editingThresholdKey={editingThresholdKey}
              setEditingThresholdKey={setEditingThresholdKey}
              selected={selectedThresholdKey === key}
              handleSelectThreshold={handleSelectThreshold}
            />
          );
        })
      )}
    </Box>
  );
}
