import React, {useEffect, useRef} from 'react';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {useTheme} from '@mui/material/styles';
import {Box} from '@mui/material';
import {selectDate} from '../store/DataSelectionSlice';
import {useGetRkiByDistrictQuery} from '../store/services/rkiApi';
import {dateToISOString} from 'util/util';
import {Dictionary} from 'util/util';

/* This component displays the evolution of the pandemic for a specific compartment (hospitalized, dead, infected, etc.) regarding the different scenarios
 */

// dummy data
const drawDeviations = true;
let dummyData = [
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

dummyData = [];
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

  dummyData.push({
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
  const theme = useTheme();
  const scenarioList = useAppSelector((state) => state.scenarioList);
  const selectedDistrict = useAppSelector((state) => state.dataSelection.district.ags);
  const selectedCompartment = useAppSelector((state) => state.dataSelection.compartment);
  const dispatch = useAppDispatch();
  const {data} = useGetRkiByDistrictQuery({
    node: selectedDistrict,
    group: '',
    compartments: selectedCompartment ? [selectedCompartment] : null,
  });

  const chartRef = useRef<am4charts.XYChart | null>(null);
  const rkiSeriesRef = useRef<am4charts.LineSeries | null>(null);

  useEffect(() => {
    // Create chart instance (is called when props.scenarios changes)
    const chart = am4core.create('chartdiv', am4charts.XYChart);
    // Add data
    chart.data = dummyData;

    // Create axes
    const dateAxis = chart.xAxes.push(new am4charts.DateAxis());
    const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.logarithmic = true;
    valueAxis.min = 1;

    // Add cursor
    chart.cursor = new am4charts.XYCursor();
    chart.cursor.xAxis = dateAxis;

    Object.entries(scenarioList.scenarios).map(([scenarioId, scenario]) => {
      const series = chart.series.push(new am4charts.LineSeries());
      series.dataFields.valueY = scenarioId;
      series.dataFields.dateX = 'date';
      series.tensionX = 0.8;
      series.strokeWidth = 1;
      series.fill = am4core.color('red'); // TODO
      series.stroke = am4core.color('red'); // TODO
      series.tooltipText = `${scenario.label}: [bold]{${scenarioId}}[/]`;

      if (drawDeviations) {
        const seriesSTD = chart.series.push(new am4charts.LineSeries());
        seriesSTD.dataFields.valueY = `${scenarioId}STDup`;
        seriesSTD.dataFields.openValueY = `${scenarioId}STDdown`;
        seriesSTD.dataFields.dateX = 'date';
        seriesSTD.tensionX = 0.8;
        seriesSTD.strokeWidth = 0;
        seriesSTD.fill = am4core.color('red'); // TODO
        seriesSTD.fillOpacity = 0.3;
        seriesSTD.stroke = am4core.color('red'); // TODO
        // override tooltip
        series.tooltipText = `${scenario.label}: [bold]{${scenarioId}STDdown} ~ {${scenarioId}STDup}[/]`;
      }
    });

    const rkiSeries = chart.series.push(new am4charts.LineSeries());
    rkiSeries.dataFields.valueY = 'value';
    rkiSeries.dataFields.dateX = 'date';
    rkiSeries.tensionX = 0.8;
    rkiSeries.strokeWidth = 1;
    rkiSeries.fill = am4core.color('red');
    rkiSeries.stroke = am4core.color('red');
    rkiSeries.tooltipText = `Infected: [bold]{value}[/]`;

    chartRef.current = chart;
    rkiSeriesRef.current = rkiSeries;
    return () => {
      chartRef.current && chartRef.current.dispose();
    };
  }, [scenarioList]);

  useEffect(() => {
    const chart = chartRef.current;

    if (chart) {
      const dateAxis = chart.xAxes.getIndex(0) as am4charts.DateAxis;
      const range = dateAxis.axisRanges.create();
      range.date = new Date();
      range.grid.above = true;
      range.grid.stroke = am4core.color('purple');
      range.grid.strokeWidth = 2;
      range.grid.strokeOpacity = 1;

      chart.events.on('hit', () => {
        range.date = new Date(dateAxis.tooltipDate.getTime() + 12 * 60 * 60 * 1000);
        dispatch(selectDate(dateToISOString(range.date)));
      });
    }
  }, [dispatch]);

  useEffect(() => {
    if (rkiSeriesRef.current) {
      rkiSeriesRef.current.data = [];
      data?.results.forEach((entry: Dictionary<number | string>) => {
        rkiSeriesRef.current?.data.push({
          date: new Date(entry['day']),
          value: entry[selectedCompartment],
        });
      });
      rkiSeriesRef.current?.invalidateData();
    }
  }, [data, selectedCompartment]);

  return (
    <Box
      id='chartdiv'
      sx={{
        height: '100%',
        width: '100%',
        margin: 0,
        padding: 0,
        backgroundColor: theme.palette.background.paper,
        backgroundImage: 'radial-gradient(#E2E4E6 10%, transparent 11%)',
        backgroundSize: '10px 10px',
        cursor: 'crosshair',
      }}
    >
      {' '}
    </Box>
  );
}
