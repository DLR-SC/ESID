// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {useLayoutEffect, useRef} from 'react';
import LoadingContainer from './shared/LoadingContainer';
import Box from '@mui/material/Box';
import {useTheme} from '@mui/material/styles';
import {Root} from '@amcharts/amcharts5/.internal/core/Root';
import {XYChart} from '@amcharts/amcharts5/.internal/charts/xy/XYChart';
import {DateAxis} from '@amcharts/amcharts5/.internal/charts/xy/axes/DateAxis';
import {AxisRenderer} from '@amcharts/amcharts5/.internal/charts/xy/axes/AxisRenderer';
import {Tooltip} from '@amcharts/amcharts5/.internal/core/render/Tooltip';
import {AxisRendererX} from '@amcharts/amcharts5/.internal/charts/xy/axes/AxisRendererX';

export default function TimeSeriesComponent() {
  const theme = useTheme();

  const rootRef = useRef<Root | null>(null);
  const chartRef = useRef<XYChart | null>(null);
  const xAxisRef = useRef<DateAxis<AxisRenderer> | null>(null);

  useLayoutEffect(() => {
    // Create root and chart
    const root = Root.new('chartdiv');
    const chart = root.container.children.push(
      XYChart.new(root, {
        panX: false,
        panY: false,
        wheelX: 'panX',
        wheelY: 'zoomX',
        maxTooltipDistance: -1,
      })
    );

    // Set number formatter
    root.numberFormatter.set('numberFormat', '#,###.');

    // Create x-axis
    const xAxis = chart.xAxes.push(
      DateAxis.new(root, {
        renderer: AxisRendererX.new(root, {}),
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
        tooltip: Tooltip.new(root, {}),
      })
    );
    // Change axis renderer to have ticks/labels on day center
    const xRenderer = xAxis.get('renderer');
    xRenderer.ticks.template.setAll({
      location: 0.5,
    });

    // Set refs to be used in other effects
    rootRef.current = root;
    chartRef.current = chart;
    xAxisRef.current = xAxis;

    // Clean-up before re-running this effect
    return () => {
      // Dispose old root and chart before creating a new instance
      chartRef.current?.dispose();
      rootRef.current?.dispose();
      xAxisRef.current?.dispose();
    };
  }, []);

  return (
    <LoadingContainer
      sx={{width: '100%', height: '100%'}}
      show={caseDataFetching || simulationFetching}
      overlayColor={theme.palette.background.paper}
    >
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
    </LoadingContainer>
  );
}
