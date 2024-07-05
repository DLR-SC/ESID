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
    let isCancelled = false;
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

    if (chart.series.length > 0 && !chart.isDisposed()) chart.series.clear();

    const seriesList: Array<LineSeries> = [];

    for (let i = 0; i < settings.length; i++) {
      const setting = settings[i];

      if (chart.isDisposed() || root.isDisposed() || isCancelled || setting.xAxis.isDisposed()) {
        return;
      }

      const newSeries = LineSeries.new(root, setting);
      seriesList.push(newSeries);

      chart.series.push(newSeries);

      if (initializer) {
        initializer(newSeries, i);
      }
    }

    if (!isCancelled) {
      setSeries(seriesList);
    }

    return () => {
      isCancelled = true;
      if (!chart.isDisposed()) {
        chart.series.clear();
      }
    };
  }, [chart, initializer, root, settings]);

  return series ?? null;
}
