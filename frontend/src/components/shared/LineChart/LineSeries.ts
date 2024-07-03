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
    if (!root || !chart || settings.length === 0) {
      return;
    }

    const seriesList: Array<LineSeries> = [];
    for (let i = 0; i < settings.length; i++) {
      const setting = settings[i];
      const newSeries = LineSeries.new(root, setting);
      seriesList.push(newSeries);

      if (initializer) {
        initializer(newSeries, i);
      }
    }

    chart.series.pushAll(seriesList);
    setSeries(seriesList);

    return () => {
      for (const entry of seriesList) {
        chart.series.removeValue(entry);
        entry.dispose();
      }
    };
  }, [chart, initializer, root, settings, settings.length]);

  return series ?? null;
}
