import React from 'react';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import {Box} from '@material-ui/core';
import {useEffect} from 'react';
import {makeStyles, createStyles, Theme} from '@material-ui/core/styles';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';

/* This component displays the evolution of the pandemic for a specific compartment ( Hospitalized,death,infected, etc.)
 regarding 4 differents scenarios
 */

const useStyles = makeStyles((_theme: Theme) =>
  createStyles({
    chart: {
      height: '100%',
    },
  })
);

export default function SimulationChart(): JSX.Element {
  const classes = useStyles();
  useEffect(() => {
    am4core.useTheme(am4themes_animated);

    // Create chart instance
    const chart = am4core.create('chartdiv', am4charts.XYChart);

    // Add data
    chart.data = [
      {date: new Date(2019, 5, 12), value1: 50, value2: 48, value3: 45, value4: 40, previousDate: new Date(2019, 5, 5)},
      {date: new Date(2019, 5, 13), value1: 53, value2: 51, value3: 48, value4: 46, previousDate: new Date(2019, 5, 6)},
      {date: new Date(2019, 5, 14), value1: 56, value2: 57, value3: 55, value4: 50, previousDate: new Date(2019, 5, 7)},
      {date: new Date(2019, 5, 15), value1: 52, value2: 53, value3: 50, value4: 48, previousDate: new Date(2019, 5, 8)},
      {date: new Date(2019, 5, 16), value1: 48, value2: 44, value3: 42, value4: 40, previousDate: new Date(2019, 5, 9)},
      {
        date: new Date(2019, 5, 17),
        value1: 47,
        value2: 42,
        value3: 40,
        value4: 38,
        previousDate: new Date(2019, 5, 10),
      },
      {
        date: new Date(2019, 5, 18),
        value1: 59,
        value2: 55,
        value3: 50,
        value4: 48,
        previousDate: new Date(2019, 5, 11),
      },
    ];

    // Create axes
    const dateAxis = chart.xAxes.push(new am4charts.DateAxis());
    dateAxis.logarithmic = true;
    dateAxis.renderer.minGridDistance = 50;
    chart.yAxes.push(new am4charts.ValueAxis());

    // Create series
    const series = chart.series.push(new am4charts.LineSeries());
    series.dataFields.valueY = 'value1';
    series.dataFields.dateX = 'date';
    series.tensionX = 0.8;
    series.strokeWidth = 1;
    series.tensionX = 0.8;
    series.tooltipText =
      '{date.formatDate()}:[/] {value1}\n {previousDate.formatDate()}:[/] {value2}\n{date.formatDate()}:[/] {value3}\n{date.formatDate()}:[/] {value4}';
    series.fill = am4core.color('#3998DB');
    series.stroke = am4core.color('#3998DB');
    // Create series
    const series2 = chart.series.push(new am4charts.LineSeries());
    series2.dataFields.valueY = 'value2';
    series2.dataFields.dateX = 'date';
    series2.tensionX = 0.8;
    series.fill = am4core.color('#876BE3');
    series.stroke = am4core.color('#876BE3');
    series2.strokeWidth = 1;
    series2.stroke = series.stroke;
    // Create series
    const series3 = chart.series.push(new am4charts.LineSeries());
    series3.dataFields.valueY = 'value3';
    series3.dataFields.dateX = 'date';
    series3.tensionX = 0.8;
    series3.strokeWidth = 1;
    series.fill = am4core.color('#CC5AC7');
    series.stroke = am4core.color('#CC5AC7');
    // Create series
    const series4 = chart.series.push(new am4charts.LineSeries());
    series4.dataFields.valueY = 'value4';
    series4.dataFields.dateX = 'date';
    series.tensionX = 0.8;
    series4.strokeWidth = 1;
    series4.stroke = series.stroke;
    series.fill = am4core.color('#EBA73B');
    series.stroke = am4core.color('#EBA73B');

    // Add cursor
    chart.cursor = new am4charts.XYCursor();
    chart.cursor.xAxis = dateAxis;
  }, []);

  return <Box id="chartdiv" className={classes.chart}></Box>;
}
