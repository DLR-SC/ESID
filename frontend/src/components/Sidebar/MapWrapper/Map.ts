import {useLayoutEffect, useState} from 'react';
import * as am5map from '@amcharts/amcharts5/map';
import {Root} from '@amcharts/amcharts5/.internal/core/Root';

export default function useMapChart(
  root: Root | null,
  settings: am5map.IMapChartSettings,
  initializer?: (chart: am5map.MapChart) => void
): am5map.MapChart | null {
  const [chart, setChart] = useState<am5map.MapChart | null>(null);

  useLayoutEffect(() => {
    if (!root || !settings) {
      return;
    }

    const newChart = root.container.children.push(am5map.MapChart.new(root, settings));
    setChart(newChart);

    if (initializer) {
      initializer(newChart);
    }

    return () => {
      newChart.dispose();
    };
  }, [root, settings, initializer]);

  return chart;
}
