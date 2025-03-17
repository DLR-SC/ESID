// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: CC0-1.0

import React from 'react';
import {Dictionary} from 'util/util';
import type {District} from 'types/district';
import type {Localization} from 'types/localization';
import type {HorizontalThreshold} from 'types/horizontalThreshold';
import HorizontalThresholdList from './HorizontalThresholdList';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';

export interface HorizontalThresholdSettingsProps {
  /** The district to which the settings apply. */
  selectedDistrict: District;

  /** The compartment to which the settings apply. */
  selectedCompartment: string;

  /** The horizontal thresholds for the y-axis. */
  horizontalThresholds: Dictionary<HorizontalThreshold>;

  /** A function that sets the horizontal thresholds for the y-axis. */
  setHorizontalThresholds: React.Dispatch<React.SetStateAction<Dictionary<HorizontalThreshold>>>;

  /** An object containing localization information (translation & number formattation). */
  localization?: Localization;
}

export default function HorizontalThresholdSettings({
  selectedDistrict,
  selectedCompartment,
  horizontalThresholds,
  setHorizontalThresholds,
  localization,
}: HorizontalThresholdSettingsProps) {
  return (
    <>
      <Divider orientation='horizontal' variant='middle' sx={{marginY: 2}} flexItem />
      <Box p={2}>
        <HorizontalThresholdList
          horizontalThresholds={horizontalThresholds}
          setHorizontalThresholds={setHorizontalThresholds}
          selectedDistrict={selectedDistrict}
          selectedCompartment={selectedCompartment}
          localization={localization}
        />
      </Box>
    </>
  );
}
