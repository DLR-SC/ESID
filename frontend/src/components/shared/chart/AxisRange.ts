// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {useLayoutEffect} from 'react';
import {Root} from '@amcharts/amcharts5/.internal/core/Root';
import {XYChart} from '@amcharts/amcharts5/.internal/charts/xy/XYChart';
import {AxisRenderer} from '@amcharts/amcharts5/.internal/charts/xy/axes/AxisRenderer';
import {DateAxis, IDateAxisDataItem} from '@amcharts/amcharts5/.internal/charts/xy/axes/DateAxis';
import {useTranslation} from 'react-i18next';
import {IGridSettings} from '@amcharts/amcharts5/.internal/charts/xy/axes/Grid';
import {IGraphicsSettings} from '@amcharts/amcharts5/.internal/core/render/Graphics';
import {IAxisLabelSettings} from '@amcharts/amcharts5/.internal/charts/xy/axes/AxisLabel';

export default function useDateAxisRange(
  settings: {
    data?: IDateAxisDataItem;
    grid?: Partial<IGridSettings>;
    axisFill?: Partial<IGraphicsSettings>;
    label?: Partial<IAxisLabelSettings>;
  },
  root: Root | null,
  chart: XYChart | null,
  xAxis: DateAxis<AxisRenderer> | null
) {
  const {i18n} = useTranslation();

  useLayoutEffect(() => {
    if (!chart || !root || !xAxis || !settings.data) {
      return;
    }

    const rangeDataItem = xAxis.makeDataItem(settings.data);
    const range = xAxis.createAxisRange(rangeDataItem);

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
      xAxis?.axisRanges.removeValue(range);
    };
  }, [chart, i18n.language, root, settings.axisFill, settings.data, settings.grid, settings.label, xAxis]);
}
