// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {useLayoutEffect, useState} from 'react';
import LoadingContainer from './shared/LoadingContainer';
import Box from '@mui/material/Box';
import {useTheme} from '@mui/material/styles';
import {Root} from '@amcharts/amcharts5/.internal/core/Root';
import {XYChart} from '@amcharts/amcharts5/.internal/charts/xy/XYChart';
import {DateAxis} from '@amcharts/amcharts5/.internal/charts/xy/axes/DateAxis';
import {AxisRenderer} from '@amcharts/amcharts5/.internal/charts/xy/axes/AxisRenderer';
import {Tooltip} from '@amcharts/amcharts5/.internal/core/render/Tooltip';
import {AxisRendererX} from '@amcharts/amcharts5/.internal/charts/xy/axes/AxisRendererX';
import {SimulationChart} from './SimulationChart';
import ContactMatrix from './ConctactMatrix';

export default function ContactMatrixView() {
  const theme = useTheme();

  const [root, setRoot] = useState<Root | null>(null);
  const [chart, setChart] = useState<XYChart | null>(null);
  const [xAxis, setXAxis] = useState<DateAxis<AxisRenderer> | null>(null);

  useLayoutEffect(() => {
    // Create root and chart
    const newRoot = Root.new('chartdiv');

    // Set number formatter
    newRoot.numberFormatter.set('numberFormat', '#,###.');

    const newChart = newRoot.container.children.push(
      XYChart.new(newRoot, {
        panX: false,
        panY: false,
        wheelX: 'panX',
        wheelY: 'zoomX',
        maxTooltipDistance: -1,
      })
    );

    newChart.leftAxesContainer.set('layout', newRoot.verticalLayout);

    // Create x-axis
    const newXAxis = newChart.xAxes.push(
      DateAxis.new(newRoot, {
        renderer: AxisRendererX.new(newRoot, {}),
        // Set base interval and aggregated intervals when the chart is zoomed out
        baseInterval: {timeUnit: 'day', count: 1},
        gridIntervals: [
          {timeUnit: 'day', count: 1},
          {timeUnit: 'day', count: 3},
          {timeUnit: 'day', count: 7},
          {timeUnit: 'month', count: 1},
          {timeUnit: 'month', count: 3},
          {timeUnit: 'year', count: 1},
        ],
        // Add tooltip instance so cursor can display value
        tooltip: Tooltip.new(newRoot, {}),
      })
    );

    // Change axis renderer to have ticks/labels on day center
    const xRenderer = newXAxis.get('renderer');
    xRenderer.ticks.template.setAll({
      location: 0.5,
    });

    setRoot(newRoot);
    setChart(newChart);
    setXAxis(newXAxis);

    // Clean-up before re-running this effect
    return () => {
      // Dispose old root and chart before creating a new instance
      newRoot?.dispose();
      newChart?.dispose();
      newXAxis?.dispose();
    };
  }, []);

  return (
    <LoadingContainer sx={{width: '100%', height: '100%'}} show={false} overlayColor={theme.palette.background.paper}>
      <Box
        id='chartdiv'
        sx={{
          height: '100%',
          margin: 0,
          padding: 0,
          backgroundColor: theme.palette.background.paper,
          backgroundImage: 'radial-gradient(#E2E4E6 10%, transparent 11%)',
          backgroundSize: '10px 10px',
          cursor: 'crosshair',
        }}
      />
      <SimulationChart root={root} chart={chart} xAxis={xAxis} />
      <ContactMatrix root={root} chart={chart} xAxis={xAxis} />
    </LoadingContainer>
  );
}
