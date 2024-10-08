// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: CC0-1.0

import React, {useState, useEffect} from 'react';
import {Grid, Box, IconButton, Typography} from '@mui/material';
import {useTheme} from '@mui/material/styles';
import AddBoxIcon from '@mui/icons-material/AddBox';
import {Dictionary} from 'util/util';
import type {District} from 'types/district';
import type {HorizontalThreshold} from 'types/horizontalThreshold';
import HorizontalThresholdList from './HorizontalThresholdList';
import ThresholdInput from './ThresholdInput';
import {selectDistrict, selectCompartment} from 'store/DataSelectionSlice';
import {useAppDispatch} from 'store/hooks';

export interface HorizontalThresholdSettingsProps {
  /** The district to which the settings apply. */
  selectedDistrict: District;

  /** The compartment to which the settings apply. */
  selectedCompartment: string;

  /** The horizontal thresholds for the y-axis. */
  horizontalThresholds: Dictionary<HorizontalThreshold>;

  /** A function that sets the horizontal thresholds for the y-axis. */
  setHorizontalThresholds: React.Dispatch<React.SetStateAction<Dictionary<HorizontalThreshold>>>;
}

export default function HorizontalThresholdSettings({
  selectedDistrict,
  selectedCompartment,
  horizontalThresholds,
  setHorizontalThresholds,
}: HorizontalThresholdSettingsProps) {
  const dispatch = useAppDispatch();
  const theme = useTheme();

  const [localThreshold, setLocalThreshold] = useState<number | null>(null);
  const [selectedThresholdKey, setSelectedThresholdKey] = useState<string>(
    `${selectedDistrict.ags}-${selectedCompartment}`
  );
  const [isAddingThreshold, setIsAddingThreshold] = useState<boolean>(false);
  const [ableToAddThreshold, setAbleToAddThreshold] = useState<boolean>(false);

  const isValid = localThreshold !== null && localThreshold > 0;

  // Checks if the user is able to add a threshold
  useEffect(() => {
    const key = `${selectedDistrict.ags}-${selectedCompartment}`;
    const existingThreshold = horizontalThresholds[key];
    if (existingThreshold) {
      setAbleToAddThreshold(false);
      return;
    }
    setAbleToAddThreshold(true);
  }, [selectedDistrict, selectedCompartment, horizontalThresholds]);

  const handleIsAddingThreshold = (value: boolean) => {
    const key = `${selectedDistrict.ags}-${selectedCompartment}`;
    const existingThreshold = horizontalThresholds[key];

    if (existingThreshold) {
      // handle error here, maybe show modal
      return;
    }
    setIsAddingThreshold(value);
  };

  // function to handle adding a new threshold
  const handleAddThreshold = () => {
    if (localThreshold === null || localThreshold < 0) {
      return;
    }

    const key = `${selectedDistrict.ags}-${selectedCompartment}`;

    const existingThreshold = horizontalThresholds[key];

    if (existingThreshold) {
      console.log('Threshold already exists');

      // handle error here, maybe show modal
      return;
    }

    const newThreshold: HorizontalThreshold = {
      district: selectedDistrict,
      compartment: selectedCompartment ?? '',
      threshold: localThreshold,
    };

    const newThresholds = {...horizontalThresholds, [key]: newThreshold};

    setHorizontalThresholds(newThresholds);
    setSelectedThresholdKey(key);
    setLocalThreshold(null);
    setIsAddingThreshold(false);
  };

  // function to handle updating an existing threshold
  const handleUpdateThreshold = (key: string, updatedThresholdValue: number) => {
    const existingThreshold = horizontalThresholds[key];

    if (existingThreshold) {
      const updatedThreshold: HorizontalThreshold = {
        ...existingThreshold,
        threshold: updatedThresholdValue,
      };

      const newThresholds = {...horizontalThresholds, [key]: updatedThreshold};

      setHorizontalThresholds(newThresholds);
      setLocalThreshold(null);
    }
  };

  // function to handle deleting a threshold
  const handleDeleteThreshold = (district: District, compartment: string) => {
    const newThresholds = {...horizontalThresholds};
    delete newThresholds[`${district.ags}-${compartment}`];

    setHorizontalThresholds(newThresholds);
  };

  const handleSelectThreshold = (threshold: HorizontalThreshold) => {
    if (isAddingThreshold) {
      return;
    }
    setSelectedThresholdKey(threshold.district.ags + '-' + threshold.compartment);
    dispatch(selectDistrict(threshold.district));
    dispatch(selectCompartment(threshold.compartment));
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minWidth: '400px',
      }}
    >
      <HorizontalThresholdList
        horizontalThresholds={horizontalThresholds}
        handleDeleteThreshold={handleDeleteThreshold}
        handleUpdateThreshold={handleUpdateThreshold}
        handleSelectThreshold={handleSelectThreshold}
        isAddingThreshold={isAddingThreshold}
        selectedDistrict={selectedDistrict}
        selectedCompartment={selectedCompartment}
        selectedThresholdKey={selectedThresholdKey}
      />
      {isAddingThreshold ? (
        <Grid
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 4,
            paddingY: 1,
            paddingX: 3,
          }}
        >
          <Box>
            <Typography variant='h2'>{selectedDistrict.name}</Typography>
            <Typography variant='subtitle1'>{selectedCompartment}</Typography>
          </Box>

          <ThresholdInput
            id='horizontal-y-threshold-input'
            value={localThreshold}
            error={!isValid}
            onChange={(e) => {
              const value = e.target.value === '' ? null : Number(e.target.value);
              setLocalThreshold(value);
            }}
            onSave={handleAddThreshold}
            onCancel={() => setIsAddingThreshold(false)}
            isSaveDisabled={!isValid}
          />
        </Grid>
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            padding: 2,
            gap: 1,

            ':hover': {
              cursor: 'pointer',
              backgroundColor: theme.palette.action.hover,
            },
          }}
          onClick={() => handleIsAddingThreshold(true)}
        >
          <IconButton
            aria-label='add Horizontal Y-threshold'
            sx={{
              color: theme.palette.primary.main,
            }}
            disabled={!ableToAddThreshold}
          >
            <AddBoxIcon fontSize='large' />
          </IconButton>
        </Box>
      )}
    </Box>
  );
}
