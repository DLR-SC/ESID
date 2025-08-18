// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: CC0-1.0

import React from 'react';
import type {District} from 'types/district';
import type {Threshold} from 'types/threshold';
import ThresholdList from './ThresholdList';

export interface ThresholdSettingsProps {
  /** The district to which the settings apply. */
  selectedDistrict: District;

  /** The compartment to which the settings apply. */
  selectedCompartment: string;

  /** Array of compartment names */
  compartments: Array<{id: string; name: string}>;

  /** The horizontal thresholds for the y-axis. */
  thresholds: Record<string, Threshold>;

  /** The function to remove a horizontal threshold. */
  removeThreshold: (id: string) => void;

  /** The function to update a horizontal threshold. */
  updateThreshold: (newThreshold: Threshold) => void;
}

export default function ThresholdSettings({
  selectedDistrict,
  selectedCompartment,
  compartments,
  thresholds,
  removeThreshold,
  updateThreshold,
}: ThresholdSettingsProps) {
  return (
    <ThresholdList
      thresholds={thresholds}
      removeThreshold={removeThreshold}
      compartments={compartments}
      updateThreshold={updateThreshold}
      selectedDistrict={selectedDistrict}
      selectedCompartment={selectedCompartment}
    />
  );
}
