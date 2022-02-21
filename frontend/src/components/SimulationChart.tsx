import React, {useEffect, useRef} from 'react';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4lang_en_US from '@amcharts/amcharts4/lang/en_US';
import am4lang_de_DE from '@amcharts/amcharts4/lang/de_DE';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {useTheme} from '@mui/material/styles';
import {Box, CircularProgress} from '@mui/material';
import {selectDate} from '../store/DataSelectionSlice';
import {useGetRkiByDistrictQuery} from '../store/services/rkiApi';
import {dateToISOString} from 'util/util';
import {useGetMultipleSimulationDataByNodeQuery} from 'store/services/scenarioApi';
import {useTranslation} from 'react-i18next';
import {NumberFormatter} from 'util/hooks';

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
  const {
    data: rkiData,
    isUninitialized: rkiUninitialized,
    isLoading: rkiLoading,
    isFetching: rkiFetching,
  } = useGetRkiByDistrictQuery(
    {
      node: selectedDistrict,
      group: 'total',
      compartments: [selectedCompartment ?? ''],
    },
    {skip: !selectedCompartment}
  );

  const {
    data: simulationData,
    isUninitialized: simulationUninitialized,
    isLoading: simulationLoading,
    isFetching: simulationFetching,
  } = useGetMultipleSimulationDataByNodeQuery(
    {
      // take scenario ids and flatten them into array
      ids: Object.entries(scenarioList.scenarios).map(([, scn]) => scn.id),
      node: selectedDistrict,
      group: '',
      compartments: [selectedCompartment ?? ''],
    },
    {skip: !selectedCompartment}
  );

  const {formatNumber} = NumberFormatter(i18n.language, 3, 8);

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
    rkiSeries.strokeWidth = 2;
    rkiSeries.fill = am4core.color('black');
    rkiSeries.stroke = am4core.color('black');
    rkiSeries.name = t('chart.rkiData');
    rkiSeries.tooltipText = `RKI Data: [bold]{rki}[/]`;

    // Add series for scenarios
    Object.entries(scenarioList.scenarios).forEach(([scenarioId, scenario], i) => {
      const series = chart.series.push(new am4charts.LineSeries());
      series.dataFields.valueY = scenarioId;
      series.dataFields.dateX = 'date';
      series.strokeWidth = 2;
      series.fill = am4core.color(theme.custom.scenarios[i % theme.custom.scenarios.length]); // loop around the color list if scenarios exceed color list
      series.stroke = series.fill;
      series.tooltipText = `[bold ${series.stroke.hex}]${scenario.label}:[/] {${scenarioId}}`;
      series.name = scenario.label;

      if (drawDeviations) {
        const seriesSTD = chart.series.push(new am4charts.LineSeries());
        seriesSTD.dataFields.valueY = `${scenarioId}STDup`;
        seriesSTD.dataFields.openValueY = `${scenarioId}STDdown`;
        seriesSTD.dataFields.dateX = 'date';
        seriesSTD.strokeWidth = 0;
        seriesSTD.fillOpacity = 0.3;
        series.fill = am4core.color(theme.custom.scenarios[i % theme.custom.scenarios.length]); // loop around the color list if scenarios exceed color list
        series.stroke = series.fill;
        // override tooltip
        series.tooltipText = `${scenario.label}: [bold]{${scenarioId}STDdown} ~ {${scenarioId}STDup}[/]`;
      }
    });

    chart.events.on('hit', () => {
      // Timezone shenanigans could get us the wrong day ...
      const date = new Date(dateAxis.tooltipDate);
      date.setUTCFullYear(date.getFullYear());
      date.setUTCMonth(date.getMonth());
      date.setUTCDate(date.getDate());
      dispatch(selectDate(dateToISOString(date)));
    });

    chartRef.current = chart;
    return () => {
      chartRef.current?.dispose();
    };
  }, [scenarioList, dispatch, i18n.language, t, theme]);

  // Effect to add Guide when date selected
  useEffect(() => {
    if (chartRef.current && selectedDate) {
      const dateAxis = chartRef.current.xAxes.getIndex(0) as am4charts.DateAxis;
      const range = dateAxis.axisRanges.create();
      range.date = new Date(selectedDate);
      range.grid.above = true;
      range.grid.stroke = am4core.color(theme.palette.primary.main);
      range.grid.strokeWidth = 2;
      range.grid.strokeOpacity = 1;
      range.label.text = '{date}';
      range.label.language.locale = dateAxis.language.locale;
      range.label.dateFormatter.dateFormat = t('dateFormat');
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
  }, [scenarioList, selectedDate, theme, t, i18n.language]);

  // Effect to update Simulation and RKI Data
  useEffect(() => {
    if (chartRef.current && simulationData && simulationData.length > 1 && selectedCompartment) {
      // clear data
      chartRef.current.data = [];

      // create map to match dates
      const dataMap = new Map<string, {[key: string]: number}>();

      // cycle through scenarios
      Object.entries(scenarioList.scenarios).forEach(([scenarioId, scenario]) => {
        simulationData[scenario.id].results.forEach(({day, compartments}) => {
          dataMap.set(day, {...dataMap.get(day), [scenarioId]: compartments[selectedCompartment]});
        });
      });

      // add rki values
      rkiData?.results.forEach((entry) => {
        dataMap.set(entry.day, {...dataMap.get(entry.day), rki: entry.compartments[selectedCompartment]});
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

      // set up tooltip
      // TODO: HTML Tooltip
      chartRef.current.series.each((series) => {
        series.adapter.add('tooltipHTML', (_, target) => {
          const data = target.tooltipDataItem.dataContext;
          const text = [`<strong>{date.formatDate("${t('dateFormat')}")} (${selectedCompartment})</strong>`];
          text.push('<table>');
          chartRef.current?.series.each((s) => {
            if (s.dataFields.valueY && (data as {[key: string]: number | string})[s.dataFields.valueY]) {
              text.push('<tr>');
              text.push(
                `<th 
                style='text-align:left; color:${(s.stroke as am4core.Color).hex}; padding-right:${theme.spacing(2)}'>
                <strong>${s.name}</strong>
                </th>`
              );
              text.push(
                `<td style='text-align:right'>${formatNumber(
                  (data as {[key: string]: number})[s.dataFields.valueY]
                )}</td>`
              );
              text.push('</tr>');
            }
          });
          text.push('</table>');
          return text.join('\n');
        });
        // fix tooltip text & background color
        if (series.tooltip) {
          series.tooltip.label.fill = am4core.color(theme.palette.text.primary);
          series.tooltip.getFillFromObject = false;
          series.tooltip.background.fill = am4core.color(theme.palette.background.paper);
        }
      });
      // prevent multiple tooltips from showing
      chartRef.current.cursor.maxTooltipDistance = 0;

      // invalidate/reload data
      chartRef.current.invalidateData();
    }
  }, [simulationData, rkiData, scenarioList, selectedCompartment, theme, formatNumber, t]);

  return (
    <Box sx={{position: 'relative', width: '100%', height: '100%'}}>
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
      />
      {(rkiUninitialized ||
        rkiLoading ||
        rkiFetching ||
        simulationUninitialized ||
        simulationLoading ||
        simulationFetching) && (
        <CircularProgress
          size={96}
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            marginTop: '-48px',
            marginLeft: '-48px',
          }}
        />
      )}
    </Box>
  );
}
