// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {XYChart} from '@amcharts/amcharts5/.internal/charts/xy/XYChart';
import {Root} from '@amcharts/amcharts5/.internal/core/Root';
import {ILineSeriesSettings, LineSeries} from '@amcharts/amcharts5/.internal/charts/xy/series/LineSeries';
import {useLineSeriesList} from './LineSeries';
import {useLayoutEffect} from 'react';
import {AxisRenderer, ValueAxis} from '@amcharts/amcharts5/xy';
import {IGraphicsSettings} from '@amcharts/amcharts5';
import {ILineSeriesAxisRange} from '@amcharts/amcharts5/.internal/charts/xy/series/LineSeries';

export function useSeriesRange(
  root: Root | null,
  chart: XYChart | null,
  settings: Array<ILineSeriesSettings>,
  yAxis: ValueAxis<AxisRenderer> | null, // The yAxis for creating range
  rangeSettings: {
    threshold?: number; // The threshold for the series range
    fills?: Partial<IGraphicsSettings>; // Fill color for the range
    strokes?: Partial<IGraphicsSettings>; // Stroke color for the range
  },
  initializer?: (series: LineSeries, i: number) => void
) {
  // Use the existing `useLineSeriesList` hook to create the series
  const seriesList = useLineSeriesList(root, chart, settings, initializer);

  // Use `useLayoutEffect` to apply the series range logic after the series are created
  useLayoutEffect(() => {
    if (!seriesList || !yAxis || seriesList.length === 0) return;

    // Iterate over each series to create and apply the series range
    seriesList.forEach((series: LineSeries) => {
      const seriesRangeDataItem = yAxis.makeDataItem({
        value: rangeSettings.threshold, // Start of the range
        endValue: 1e6, // End value of the range (adjust as needed)
      });

      const seriesRange = series.createAxisRange(seriesRangeDataItem);

      // Set the fill and stroke properties for the range
      if (rangeSettings.fills) {
        seriesRange.fills?.template.setAll(rangeSettings.fills);
      }

      if (rangeSettings.strokes) {
        seriesRange.strokes?.template.setAll(rangeSettings.strokes);
      }
    });

    return () => {
      // Dispose of the ranges when the component unmounts
      seriesList.forEach((series: LineSeries) => {
        series.axisRanges.each((range: ILineSeriesAxisRange) => {
          if (series.axisRanges.contains(range)) {
            series.axisRanges.removeValue(range);
          }
        });
      });
    };
  }, [seriesList, rangeSettings, yAxis]);

  return seriesList ?? null;
}
