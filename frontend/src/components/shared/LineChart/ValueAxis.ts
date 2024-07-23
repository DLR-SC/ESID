// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {Root} from '@amcharts/amcharts5/.internal/core/Root';
import {IValueAxisSettings} from '@amcharts/amcharts5/xy';
import {ValueAxis} from '@amcharts/amcharts5/.internal/charts/xy/axes/ValueAxis';
import {useLayoutEffect, useState} from 'react';
import {AxisRenderer} from '@amcharts/amcharts5/.internal/charts/xy/axes/AxisRenderer';
import {XYChart} from '@amcharts/amcharts5/.internal/charts/xy/XYChart';
import {AxisRendererX} from '@amcharts/amcharts5/.internal/charts/xy/axes/AxisRendererX';
import {AxisRendererY} from '@amcharts/amcharts5/.internal/charts/xy/axes/AxisRendererY';

export default function useValueAxis(
  root: Root | null,
  chart: XYChart | null,
  settings: IValueAxisSettings<AxisRenderer> | null,
  initializer?: (axis: ValueAxis<AxisRenderer>) => void
): ValueAxis<AxisRenderer> | null {
  const [axis, setAxis] = useState<ValueAxis<AxisRenderer>>();

  useLayoutEffect(() => {
    if (!root || !chart || !settings) return;

    const newAxis = ValueAxis.new(root, settings);
    setAxis(newAxis);
    if (settings.renderer instanceof AxisRendererX) {
      chart.xAxes.push(newAxis);
    } else if (settings.renderer instanceof AxisRendererY) {
      chart.yAxes.push(newAxis);
    } else {
      console.warn('Could not determine which chart axis to attach to!');
    }

    if (initializer) {
      initializer(newAxis);
    }

    return () => {
      if (settings.renderer instanceof AxisRendererX) {
        chart.xAxes.removeValue(newAxis);
      } else if (settings.renderer instanceof AxisRendererY) {
        chart.yAxes.removeValue(newAxis);
      }

      newAxis.dispose();
    };
  }, [root, chart, settings, initializer]);

  return axis ?? null;
}
