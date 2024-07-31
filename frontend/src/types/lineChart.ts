// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {Color} from '@amcharts/amcharts5/.internal/core/util/Color';

/**
 * Represents the data for a line chart.
 */
export interface LineChartData {
  /**
   * The values for the line chart.
   */
  values: {day: string; value: number | number[]}[];

  /**
   * The name of the line chart.
   */
  name?: string;

  /**
   * The ID of the series.
   */
  serieId: string | number;

  /**
   * The field used for the Y-axis value.
   */
  valueYField: string | number;

  /**
   * The field used for the open Y-axis value.
   */
  openValueYField?: string | number;

  /**
   * Indicates whether the line chart is visible.
   */
  visible?: boolean;

  /**
   * The tooltip text for the line chart.
   */
  tooltipText?: string;

  /**
   * The stroke properties for the line chart.
   */
  stroke: {
    /**
     * The color of the stroke.
     */
    color?: Color;

    /**
     * The width of the stroke.
     */
    strokeWidth?: number;

    /**
     * The dash array for the stroke.
     */
    strokeDasharray?: number[];
  };

  /**
   * The fill color for the line chart.
   */
  fill?: Color;

  /**
   * The opacity of the fill color.
   */
  fillOpacity?: number;

  /**
   * The ID of the parent element.
   */
  parentId?: string | number;
}
