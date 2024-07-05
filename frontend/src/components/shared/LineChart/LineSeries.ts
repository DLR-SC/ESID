// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0
import {XYChart} from '@amcharts/amcharts5/.internal/charts/xy/XYChart';
import {Root} from '@amcharts/amcharts5/.internal/core/Root';
import {ILineSeriesSettings, LineSeries} from '@amcharts/amcharts5/.internal/charts/xy/series/LineSeries';
import {useLayoutEffect, useState} from 'react';
export function useLineSeriesList(
  root: Root | null,
  chart: XYChart | null,
  settings: Array<ILineSeriesSettings>,
  initializer?: (series: LineSeries, i: number) => void
) {
  const [series, setSeries] = useState<Array<LineSeries>>();
  useLayoutEffect(() => {
    try {
      if (
        !root ||
        !chart ||
        settings.length === 0 ||
        chart.isDisposed() ||
        chart.series.isDisposed() ||
        root.isDisposed()
      ) {
        return;
      }
      if (chart.series.length > 0 && !chart.isDisposed()) {
        chart.series.clear();
        chart.series.dispose();
      }
      // if (chart.series.length > 0) chart.series.removeIndex(0).dispose();
      const seriesList: Array<LineSeries> = [];
      for (let i = 0; i < settings.length; i++) {
        const setting = settings[i];
        const newSeries = LineSeries.new(root, setting);
        seriesList.push(newSeries);
        // chart.series.push(newSeries);
        if (initializer) {
          initializer(newSeries, i);
        }
      }
      setSeries(seriesList);
      chart.series.pushAll(seriesList);
      return () => {
        console.log(chart.series);
        // if (chart.series.length > 0) chart.series.removeIndex(0).dispose();
        // seriesList.forEach((series) => {
        //   series.dispose();
        // });
        if (chart.series.length > 0 && !chart.isDisposed()) {
          chart.series.clear();
          chart.series.dispose();
        }
      };
    } catch (error) {
      console.log(root, chart, chart.series);
      console.error('Error creating series:', error);
    }
  }, [chart, initializer, root, settings]);
  return series ?? null;
}
