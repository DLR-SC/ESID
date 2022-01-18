import React, {useEffect, useRef} from 'react';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4lang_en_US from '@amcharts/amcharts4/lang/en_US';
import am4lang_de_DE from '@amcharts/amcharts4/lang/de_DE';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {useTheme} from '@mui/material/styles';
import {Box} from '@mui/material';
import {selectDate} from '../store/DataSelectionSlice';
import {useGetRkiByDistrictQuery} from '../store/services/rkiApi';
import {dateToISOString} from 'util/util';
import {Dictionary} from 'util/util';
import {useGetMultipleSimulationDataByNodeQuery} from 'store/services/scenarioApi';
import {useTranslation} from 'react-i18next';

/* This component displays the evolution of the pandemic for a specific compartment (hospitalized, dead, infected, etc.) regarding the different scenarios
 */

// deviations toggle (TODO)
const drawDeviations = false;

/**
 * React Component to render the Simulation Chart Section
 * @returns {JSX.Element} JSX Element to render the scenario chart container and the scenario graph within.
 */
export default function SimulationChart(): JSX.Element {
  const {t, i18n} = useTranslation();
  const theme = useTheme();
  const scenarioList = useAppSelector((state) => state.scenarioList);
  const selectedDistrict = useAppSelector((state) => state.dataSelection.district.ags);
  const selectedCompartment = useAppSelector((state) => state.dataSelection.compartment);
  const selectedDate = useAppSelector((state) => state.dataSelection.date);
  const dispatch = useAppDispatch();
  const {data: rkiData} = useGetRkiByDistrictQuery({
    node: selectedDistrict,
    group: 'total',
    compartments: selectedCompartment ? [selectedCompartment] : null,
  });

  const {data: simulationData} = useGetMultipleSimulationDataByNodeQuery({
    // take scenario ids and flatten them into array
    ids: Object.entries(scenarioList.scenarios).map(([, scn]) => scn.id),
    node: selectedDistrict,
    group: '',
    compartments: selectedCompartment ? [selectedCompartment] : null,
  });

  const chartRef = useRef<am4charts.XYChart | null>(null);

  useEffect(() => {
    // Create chart instance (is called when props.scenarios changes)
    const chart = am4core.create('chartdiv', am4charts.XYChart);
    // Set localization
    chart.language.locale = i18n.language === 'de' ? am4lang_de_DE : am4lang_en_US;

    // Create axes
    const dateAxis = chart.xAxes.push(new am4charts.DateAxis());
    const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.min = 0;

    // Add cursor
    chart.cursor = new am4charts.XYCursor();
    chart.cursor.xAxis = dateAxis;

    // Add series for RKI Data
    const rkiSeries = chart.series.push(new am4charts.LineSeries());
    rkiSeries.dataFields.valueY = 'rki';
    rkiSeries.dataFields.dateX = 'date';
    rkiSeries.tensionX = 0.8;
    rkiSeries.strokeWidth = 1;
    rkiSeries.fill = am4core.color('red');
    rkiSeries.stroke = am4core.color('red');
    rkiSeries.tooltipText = `RKI Data: [bold]{rki}[/]`;

    // Add series for scenarios
    Object.entries(scenarioList.scenarios).forEach(([scenarioId, scenario]) => {
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

    chart.events.on('hit', () => {
      const date = new Date(dateAxis.tooltipDate.getTime());
      dispatch(selectDate(dateToISOString(date)));
    });

    chartRef.current = chart;
    return () => {
      chartRef.current?.dispose();
    };
  }, [scenarioList, dispatch, i18n.language]);

  // Effect to add Guide when date selected
  useEffect(() => {
    if (chartRef.current) {
      const dateAxis = chartRef.current.xAxes.getIndex(0) as am4charts.DateAxis;
      const range = dateAxis.axisRanges.create();
      range.date = new Date(selectedDate);
      range.grid.above = true;
      range.grid.stroke = am4core.color(`${theme.palette.primary.main}`);
      range.grid.strokeWidth = 2;
      range.grid.strokeOpacity = 1;
      range.label.text = '{date}';
      range.label.language.locale = dateAxis.language.locale;
      range.label.dateFormatter.dateFormat = `${t('dateFormat')}`;
      range.label.fill = am4core.color('white');
      range.label.background.fill = range.grid.stroke;
    }

    // remove old ranges before creating a new one
    return () => {
      const ranges = chartRef.current?.xAxes.getIndex(0)?.axisRanges;
      ranges?.values.forEach((range) => {
        ranges.removeValue(range);
      });
    };
  }, [selectedDate, scenarioList, theme, t, i18n.language]);

  // Effect to update Simulation and RKI Data
  useEffect(() => {
    if (chartRef.current && simulationData && simulationData.length > 1) {
      // clear data
      chartRef.current.data = [];

      // create map to match dates
      const dataMap = new Map<string, {[key: string]: number}>();

      // cycle through scenarios
      Object.entries(scenarioList.scenarios).forEach(([scenarioId, scenario]) => {
        simulationData[scenario.id].results.forEach(({day, ...compartments}) => {
          dataMap.set(day, {...dataMap.get(day), [scenarioId]: compartments[selectedCompartment] as number});
        });
      });

      // add rki values
      rkiData?.results.forEach((entry: Dictionary<number | string>) => {
        dataMap.set(entry['day'] as string, {
          ...dataMap.get(entry['day'] as string),
          rki: entry[selectedCompartment] as number,
        });
      });

      // sort map by date
      const dataMapSorted = new Map(Array.from(dataMap).sort(([a], [b]) => String(a).localeCompare(b)));

      // push DataMap into chart data
      dataMapSorted.forEach((values, day) => {
        chartRef.current?.data.push({
          date: day,
          ...values,
        });
      });
      chartRef.current?.invalidateData();
    }
  }, [simulationData, rkiData, scenarioList, selectedCompartment]);

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
