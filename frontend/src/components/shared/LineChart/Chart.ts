// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {IXYChartSettings, XYChart} from '@amcharts/amcharts5/.internal/charts/xy/XYChart';
import {useLayoutEffect, useState} from 'react';
import {Root} from '@amcharts/amcharts5/.internal/core/Root';

export default function useXYChart(
  root: Root | null,
  settings: IXYChartSettings,
  initializer?: (chart: XYChart) => void
): XYChart | null {
  const [chart, setChart] = useState<XYChart>();

  useLayoutEffect(() => {
    if (!root) {
      return;
    }

    const newChart = XYChart.new(root, settings);
    root.container.children.push(newChart);
    setChart(newChart);

    if (initializer) {
      initializer(newChart);
    }

    return () => {
      root.container.children.removeValue(newChart);
      newChart.dispose();
    };
  }, [root, settings, initializer]);

  return chart ?? null;
}
