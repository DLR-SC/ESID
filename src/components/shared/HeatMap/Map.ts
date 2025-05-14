// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {useState, useLayoutEffect} from 'react';
import * as am5map from '@amcharts/amcharts5/map';
import {Root} from '@amcharts/amcharts5/.internal/core/Root';
import {MapChart} from '@amcharts/amcharts5/map';

export default function useMapChart(
  root: Root | null,
  settings: am5map.IMapChartSettings | null,
  initializer?: (chart: MapChart) => void
): MapChart | null {
  const [chart, setChart] = useState<MapChart>();

  useLayoutEffect(() => {
    if (!root || !settings) {
      return;
    }

    const newChart = am5map.MapChart.new(root, settings);
    root.container.children.push(newChart);

    setChart(newChart);

    if (initializer) {
      initializer(newChart);
    }

    return () => {
      newChart.dispose();
    };
  }, [root, settings, initializer]);

  return chart ?? null;
}
