// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

/**
 * Represents a heatmap legend.
 */
export interface HeatmapLegend {
  /**
   * The name of the legend.
   */
  name: string;
  
  /**
   * Indicates whether the legend values are normalized.
   */
  isNormalized: boolean;
  
  /**
   * The steps in the legend, each containing a color and a corresponding value.
   */
  steps: {
    /**
     * The color associated with the value.
     */
    color: string;
    
    /**
     * The value associated with the color.
     */
    value: number;
  }[];
}
