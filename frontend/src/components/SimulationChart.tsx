import React from 'react';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import {useEffect} from 'react';
import {createStyles, makeStyles} from '@mui/styles';
import {Box} from '@mui/material';

/* This component displays the evolution of the pandemic for a specific compartment ( Hospitalized,death,infected, etc.)
 regarding 4 differents scenarios
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

// list of Name and Color for Scenario Cards
interface Scenario {
  id: string;
  label: string;
  color: string;
}

export default function SimulationChart(props: {scenarios: Scenario[]}): JSX.Element {
  const classes = useStyles();
  const scenarios = props.scenarios;

  useEffect(() => {
    // Create chart instance
    const chart = am4core.create('chartdiv', am4charts.XYChart);

    // Add data
    chart.data = [
      {date: new Date(2019, 5, 12), basic: 50, medium: 48, big: 45, maximum: 40, previousDate: new Date(2019, 5, 5)},
      {date: new Date(2019, 5, 13), basic: 53, medium: 51, big: 48, maximum: 46, previousDate: new Date(2019, 5, 6)},
      {date: new Date(2019, 5, 14), basic: 56, medium: 57, big: 55, maximum: 50, previousDate: new Date(2019, 5, 7)},
      {date: new Date(2019, 5, 15), basic: 52, medium: 53, big: 50, maximum: 48, previousDate: new Date(2019, 5, 8)},
      {date: new Date(2019, 5, 16), basic: 48, medium: 44, big: 42, maximum: 40, previousDate: new Date(2019, 5, 9)},
      {date: new Date(2019, 5, 17), basic: 47, medium: 42, big: 40, maximum: 38, previousDate: new Date(2019, 5, 10)},
      {date: new Date(2019, 5, 18), basic: 59, medium: 55, big: 50, maximum: 48, previousDate: new Date(2019, 5, 11)},
    ];

    // Create axes
    const dateAxis = chart.xAxes.push(new am4charts.DateAxis());
    dateAxis.logarithmic = true;
    dateAxis.renderer.minGridDistance = 50;
    chart.yAxes.push(new am4charts.ValueAxis());

    scenarios.map((scn) => {
      const series = chart.series.push(new am4charts.LineSeries());
      series.dataFields.valueY = scn.id;
      series.dataFields.dateX = 'date';
      series.tensionX = 0.8;
      series.strokeWidth = 1;
      series.fill = am4core.color(scn.color);
      series.stroke = am4core.color(scn.color);
      series.tooltipText = `${scn.label}: [bold]{${scn.id}}[/]`;
    });

    // Add cursor
    chart.cursor = new am4charts.XYCursor();
    chart.cursor.xAxis = dateAxis;
  }, [scenarios]);

  return (
    <Box id='chartdiv' className={classes.chart}>
      {' '}
    </Box>
  );
}
