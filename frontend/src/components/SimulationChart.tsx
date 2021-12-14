import React, {useEffect, useRef} from 'react';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {createStyles, makeStyles} from '@mui/styles';
import {Box} from '@mui/material';
import {selectDate} from '../store/DataSelectionSlice';

/* This component displays the evolution of the pandemic for a specific compartment (hospitalized, dead, infected, etc.) regarding the different scenarios
 */

const useStyles = makeStyles(() =>
  createStyles({
    chart: {
      height: '100%',
      width: '100%',
      margin: 0,
      padding: 0,
      backgroundColor: 'white',
      backgroundImage: 'radial-gradient(#E2E4E6 10%, transparent 11%)',
      backgroundSize: '10px 10px',
      cursor: 'crosshair',
    },
  })
);

// dummy data
const drawDeviations = true;
let data = [
  {
    date: new Date(2020, 0, 1),
    basic: 0,
    basicSTDup: 0,
    basicSTDdown: 0,
    medium: 0,
    mediumSTDup: 0,
    mediumSTDdown: 0,
    big: 0,
    bigSTDup: 0,
    bigSTDdown: 0,
    maximum: 0,
    maximumSTDup: 0,
    maximumSTDdown: 0,
  },
];

data = [];
for (let i = 0; i < 600; i++) {
  const date = new Date(2020, 2, i);
  const basic = 100 * Math.sin(i / 100.0) + 150;
  const basicSTDup = basic;
  const basicSTDdown = basic;
  const medium = 100 * Math.cos(i / 100.0) + 175;
  const mediumSTDup = medium + i / 15.0;
  const mediumSTDdown = medium - i / 15.0;
  const big = 100 * Math.cos(i / 100.0) + 100 * Math.sin(i / 100) + 200;
  const bigSTDup = big + i / 15.0;
  const bigSTDdown = big - i / 15.0;
  const maximum = 100 * Math.cos(i / 100.0) - 100 * Math.sin(i / 100) + 225;
  const maximumSTDup = maximum + i / 15.0;
  const maximumSTDdown = maximum - i / 15.0;

  data.push({
    date,
    basic,
    basicSTDup,
    basicSTDdown,
    medium,
    mediumSTDup,
    mediumSTDdown,
    big,
    bigSTDup,
    bigSTDdown,
    maximum,
    maximumSTDup,
    maximumSTDdown,
  });
}

/**
 * React Component to render the Simulation Chart Section
 * @returns {JSX.Element} JSX Element to render the scenario chart container and the scenario graph within.
 */
export default function SimulationChart(): JSX.Element {
  const classes = useStyles();
  const scenarioList = useAppSelector((state) => state.scenarioList);
  const dispatch = useAppDispatch();

  const chartRef = useRef<am4charts.XYChart | null>(null);

  useEffect(() => {
    // Create chart instance (is called when props.scenarios changes)
    const chart = am4core.create('chartdiv', am4charts.XYChart);

    // Add data
    chart.data = data;

    // Create axes
    const dateAxis = chart.xAxes.push(new am4charts.DateAxis());
    chart.yAxes.push(new am4charts.ValueAxis());

    Object.entries(scenarioList).map(([scn_id, scn_info]) => {
      const series = chart.series.push(new am4charts.LineSeries());
      series.dataFields.valueY = scn_id;
      series.dataFields.dateX = 'date';
      series.tensionX = 0.8;
      series.strokeWidth = 1;
      series.fill = am4core.color(scn_info.color);
      series.stroke = am4core.color(scn_info.color);
      series.tooltipText = `${scn_info.label}: [bold]{${scn_id}}[/]`;

      if (drawDeviations) {
        const seriesSTD = chart.series.push(new am4charts.LineSeries());
        seriesSTD.dataFields.valueY = `${scn_id}STDup`;
        seriesSTD.dataFields.openValueY = `${scn_id}STDdown`;
        seriesSTD.dataFields.dateX = 'date';
        seriesSTD.tensionX = 0.8;
        seriesSTD.strokeWidth = 0;
        seriesSTD.fill = am4core.color(scn_info.color);
        seriesSTD.fillOpacity = 0.3;
        seriesSTD.stroke = am4core.color(scn_info.color);
        // override tooltip
        series.tooltipText = `${scn_info.label}: [bold]{${scn_id}STDdown} ~ {${scn_id}STDup}[/] {date}`;
      }
    });

    // Add cursor
    chart.cursor = new am4charts.XYCursor();
    chart.cursor.xAxis = dateAxis;

    const range = dateAxis.axisRanges.create();
    range.date = new Date();
    range.grid.above = true;
    range.grid.stroke = am4core.color('purple');
    range.grid.strokeWidth = 2;
    range.grid.strokeOpacity = 1;

    chart.events.on('hit', () => {
      dispatch(selectDate(dateAxis.tooltipDate.getTime() + (24 * 60 * 60 * 1000)));
      range.date = new Date(dateAxis.tooltipDate.getTime() + (12 * 60 * 60 * 1000));
    });

    chartRef.current = chart;
    return () => {
      chartRef.current && chartRef.current.dispose();
    };
  }, [dispatch, scenarioList]);


  return (
    <Box id='chartdiv' className={classes.chart}>
      {' '}
    </Box>
  );
}
