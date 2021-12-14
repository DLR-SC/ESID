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
const data = [
  {
    date: new Date(2020, 4, 1),
    basic: 50,
    basicSTDup: 50,
    basicSTDdown: 50,
    medium: 48,
    mediumSTDup: 48,
    mediumSTDdown: 48,
    big: 45,
    bigSTDup: 45,
    bigSTDdown: 45,
    maximum: 40,
    maximumSTDup: 40,
    maximumSTDdown: 40,
  },
  {
    date: new Date(2020, 7, 1),
    basic: 53,
    basicSTDup: 53,
    basicSTDdown: 53,
    medium: 51,
    mediumSTDup: 51.33,
    mediumSTDdown: 50.67,
    big: 48,
    bigSTDup: 48.33,
    bigSTDdown: 47.67,
    maximum: 46,
    maximumSTDup: 46.33,
    maximumSTDdown: 45.67,
  },
  {
    date: new Date(2020, 10, 1),
    basic: 56,
    basicSTDup: 56,
    basicSTDdown: 56,
    medium: 57,
    mediumSTDup: 57.66,
    mediumSTDdown: 56.34,
    big: 55,
    bigSTDup: 55.66,
    bigSTDdown: 54.34,
    maximum: 50,
    maximumSTDup: 50.66,
    maximumSTDdown: 49.34,
  },
  {
    date: new Date(2021, 1, 1),
    basic: 52,
    basicSTDup: 52,
    basicSTDdown: 52,
    medium: 53,
    mediumSTDup: 54,
    mediumSTDdown: 52,
    big: 50,
    bigSTDup: 51,
    bigSTDdown: 49,
    maximum: 48,
    maximumSTDup: 49,
    maximumSTDdown: 47,
  },
  {
    date: new Date(2021, 4, 1),
    basic: 48,
    basicSTDup: 48,
    basicSTDdown: 48,
    medium: 44,
    mediumSTDup: 45.33,
    mediumSTDdown: 42.67,
    big: 42,
    bigSTDup: 43.33,
    bigSTDdown: 40.67,
    maximum: 40,
    maximumSTDup: 41.33,
    maximumSTDdown: 38.67,
  },
  {
    date: new Date(2021, 7, 1),
    basic: 47,
    basicSTDup: 47,
    basicSTDdown: 47,
    medium: 42,
    mediumSTDup: 43.66,
    mediumSTDdown: 40.34,
    big: 40,
    bigSTDup: 41.66,
    bigSTDdown: 38.34,
    maximum: 38,
    maximumSTDup: 39.66,
    maximumSTDdown: 36.34,
  },
  {
    date: new Date(2021, 10, 1),
    basic: 59,
    basicSTDup: 59,
    basicSTDdown: 59,
    medium: 55,
    mediumSTDup: 57,
    mediumSTDdown: 53,
    big: 50,
    bigSTDup: 52,
    bigSTDdown: 48,
    maximum: 48,
    maximumSTDup: 50,
    maximumSTDdown: 46,
  },
];

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
    dateAxis.logarithmic = true;
    dateAxis.renderer.minGridDistance = 50;
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
        series.tooltipText = `${scn_info.label}: [bold]{${scn_id}STDdown} ~ {${scn_id}STDup}[/]`;
      }
    });

    // Add cursor
    chart.cursor = new am4charts.XYCursor();
    chart.cursor.xAxis = dateAxis;

    chart.events.on('hit', () => {
      dispatch(selectDate(dateAxis.tooltipDate.getTime() + (24 * 60 * 60 * 1000)));
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
