// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

export interface HeatmapLegend {
  name: string;
  isNormalized: boolean;
  steps: {
    color: string;
    value: number;
  }[];
}
