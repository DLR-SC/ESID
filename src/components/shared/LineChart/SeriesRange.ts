// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {XYChart} from '@amcharts/amcharts5/.internal/charts/xy/XYChart';
import {Root} from '@amcharts/amcharts5/.internal/core/Root';
import {ILineSeriesSettings, LineSeries} from '@amcharts/amcharts5/.internal/charts/xy/series/LineSeries';
import {useLineSeriesList} from './LineSeries';
import {useLayoutEffect} from 'react';
import {AxisRenderer, ValueAxis} from '@amcharts/amcharts5/xy';
import {IGraphicsSettings} from '@amcharts/amcharts5';

export function useSeriesRange(
  root: Root | null,
  chart: XYChart | null,
  lineChartSettings: Array<ILineSeriesSettings>,
  yAxis: ValueAxis<AxisRenderer> | null,
  rangeSettings: Array<{
    threshold?: number;
    fills?: Partial<IGraphicsSettings>;
    strokes?: Partial<IGraphicsSettings>;
    alternatingStrokes?: Partial<IGraphicsSettings>;
  }>, // Update to accept an array of settings
  initializer?: (series: LineSeries, i: number) => void
) {
  // Use the existing `useLineSeriesList` hook to create the series
  const seriesList = useLineSeriesList(root, chart, lineChartSettings, initializer);

  // Use `useLayoutEffect` to apply the series range logic after the series are created
  useLayoutEffect(() => {
    if (!seriesList || !yAxis || seriesList.length === 0 || !rangeSettings) return;

    // Iterate over each series passed on and match the corresponding range settings
    seriesList.forEach((series: LineSeries, index: number) => {
      const rangeSetting = rangeSettings[index]; // Match range settings by index
      if (!rangeSetting || !rangeSetting.threshold) return;

      const seriesRangeDataItem = yAxis.makeDataItem({
        value: rangeSetting.threshold, // Start of the range
        endValue: 1e6, // end value range (top of the chart)
      });

      // this creates a new range series with it's own styling for alternating strokes
      if (rangeSetting.alternatingStrokes) {
        const alternatingStrokeSeriesRange = series.createAxisRange(seriesRangeDataItem);
        alternatingStrokeSeriesRange.strokes?.template.setAll(rangeSetting.alternatingStrokes);
      }

      const aboveThresholdRange = series.createAxisRange(seriesRangeDataItem);

      // apply fill settings to aboveThresholdRange
      if (rangeSetting.fills) {
        aboveThresholdRange.fills?.template.setAll(rangeSetting.fills);
      }

      // apply stroke settings to aboveThresholdRange
      if (rangeSetting.strokes) {
        aboveThresholdRange.strokes?.template.setAll(rangeSetting.strokes);
      }
    });

    return () => {
      seriesList.forEach((series: LineSeries) => {
        // Clear the axis ranges when the component is unmounted
        if (!series.isDisposed()) {
          series.axisRanges.clear();
        }
      });
    };
  }, [seriesList, rangeSettings, yAxis, chart]);

  return seriesList ?? null;
}
