// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {Color} from '@amcharts/amcharts5/.internal/core/util/Color';

export interface LineChartData {
  values: {day: string; value: number | number[]}[];
  name?: string;
  serieId: string | number;
  valueYField: string | number;
  openValueYField?: string | number;
  visible?: boolean;
  tooltipText?: string;
  stroke: {
    color?: Color;
    strokeWidth?: number;
    strokeDasharray?: number[];
  };
  fill?: Color;
  fillOpacity?: number;
  parentId?: string | number;
}
