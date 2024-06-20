// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {useLayoutEffect, useState} from 'react';
import * as am5map from '@amcharts/amcharts5/map';
import {Root} from '@amcharts/amcharts5/.internal/core/Root';

export default function usePolygonSeries(
  root: Root | null,
  chart: am5map.MapChart | null,
  settings: am5map.IMapPolygonSeriesSettings,
  initializer?: (polygon: am5map.MapPolygonSeries) => void
): am5map.MapPolygonSeries | null {
  const [polygon, setPolygon] = useState<am5map.MapPolygonSeries>();

  useLayoutEffect(() => {
    if (!root || !chart || !settings) {
      return;
    }

    const newPolygon = chart.series.push(am5map.MapPolygonSeries.new(root, settings));

    if (initializer) {
      initializer(newPolygon);
    }

    setPolygon(newPolygon);

    return () => {
      newPolygon.dispose();
    };
  }, [root, settings, chart, initializer]);

  return polygon ?? null;
}
