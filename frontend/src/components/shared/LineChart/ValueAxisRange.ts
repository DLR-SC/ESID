// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {useLayoutEffect} from 'react';
import {Root} from '@amcharts/amcharts5/.internal/core/Root';
import {XYChart} from '@amcharts/amcharts5/.internal/charts/xy/XYChart';
import {ValueAxis} from '@amcharts/amcharts5/.internal/charts/xy/axes/ValueAxis';
import {AxisRenderer} from '@amcharts/amcharts5/.internal/charts/xy/axes/AxisRenderer';
import {IValueAxisDataItem} from '@amcharts/amcharts5/.internal/charts/xy/axes/ValueAxis';
import {IGridSettings} from '@amcharts/amcharts5/.internal/charts/xy/axes/Grid';
import {IGraphicsSettings} from '@amcharts/amcharts5/.internal/core/render/Graphics';
import {IAxisLabelSettings} from '@amcharts/amcharts5/.internal/charts/xy/axes/AxisLabel';

// This hook is used to create a value axis range for the chart.
export default function useValueAxisRange(
  settings: {
    data?: IValueAxisDataItem;
    grid?: Partial<IGridSettings>;
    axisFill?: Partial<IGraphicsSettings>;
    label?: Partial<IAxisLabelSettings>;
  },
  root: Root | null,
  chart: XYChart | null,
  yAxis: ValueAxis<AxisRenderer> | null
) {
  useLayoutEffect(() => {
    if (!chart || !root || !yAxis || !settings.data) {
      return;
    }

    const rangeDataItem = yAxis.makeDataItem(settings.data);
    const range = yAxis.createAxisRange(rangeDataItem);

    if (settings.grid) {
      range.get('grid')?.setAll(settings.grid);
    }

    if (settings.axisFill) {
      range.get('axisFill')?.setAll(settings.axisFill);
    }

    if (settings.label) {
      range.get('label')?.setAll(settings.label);
    }

    return () => {
      yAxis?.axisRanges.removeValue(range);
    };
  }, [chart, root, settings.axisFill, settings.data, settings.grid, settings.label, yAxis]);
}
