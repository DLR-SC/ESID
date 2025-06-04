// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: CC0-1.0

import React from 'react';
import type {District} from 'types/district';
import type {HorizontalThreshold} from 'types/horizontalThreshold';
import HorizontalThresholdList from './HorizontalThresholdList';

export interface HorizontalThresholdSettingsProps {
  /** The district to which the settings apply. */
  selectedDistrict: District;

  /** The compartment to which the settings apply. */
  selectedCompartment: string;

  /** The horizontal thresholds for the y-axis. */
  horizontalThresholds: Record<string, HorizontalThreshold>;

  /** The function to remove a horizontal threshold. */
  removeHorizontalThreshold: (id: string) => void;

  /** The function to update a horizontal threshold. */
  updateHorizontalThreshold: (newThreshold: HorizontalThreshold) => void;
}

export default function HorizontalThresholdSettings({
  selectedDistrict,
  selectedCompartment,
  horizontalThresholds,
  removeHorizontalThreshold,
  updateHorizontalThreshold,
}: HorizontalThresholdSettingsProps) {
  return (
    <HorizontalThresholdList
      horizontalThresholds={horizontalThresholds}
      removeHorizontalThreshold={removeHorizontalThreshold}
      updateHorizontalThreshold={updateHorizontalThreshold}
      selectedDistrict={selectedDistrict}
      selectedCompartment={selectedCompartment}
    />
  );
}
