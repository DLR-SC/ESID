// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: CC0-1.0

import React from 'react';
import {Dictionary} from 'util/util';
import type {District} from 'types/district';
import type {HorizontalThreshold} from 'types/horizontalThreshold';
import HorizontalThresholdList from './HorizontalThresholdList';

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
  return (
    <HorizontalThresholdList
      horizontalThresholds={horizontalThresholds}
      setHorizontalThresholds={setHorizontalThresholds}
      selectedDistrict={selectedDistrict}
      selectedCompartment={selectedCompartment}
    />
  );
}
