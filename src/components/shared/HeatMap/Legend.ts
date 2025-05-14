// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {useState, useLayoutEffect} from 'react';
import {HeatLegend, IHeatLegendSettings} from '@amcharts/amcharts5';
import * as am5 from '@amcharts/amcharts5';
import {Root} from '@amcharts/amcharts5/.internal/core/Root';

export default function useHeatLegend(
  root: Root | null,
  settings: IHeatLegendSettings,
  initializer?: (legend: HeatLegend) => void
): HeatLegend | null {
  const [legend, setLegend] = useState<HeatLegend>();

  useLayoutEffect(() => {
    if (!root) {
      return;
    }
    const newLegend = root.container.children.push(am5.HeatLegend.new(root, settings));

    setLegend(newLegend);

    if (initializer) {
      initializer(newLegend);
    }

    return () => {
      newLegend.dispose();
    };
  }, [root, settings, initializer]);

  return legend ?? null;
}
