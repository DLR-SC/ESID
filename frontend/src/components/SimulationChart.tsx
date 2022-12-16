import React, {useEffect, useRef} from 'react';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4lang_en_US from '@amcharts/amcharts4/lang/en_US';
import am4lang_de_DE from '@amcharts/amcharts4/lang/de_DE';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {useTheme} from '@mui/material/styles';
import {Box} from '@mui/material';
import {selectDate} from '../store/DataSelectionSlice';
import {useGetCaseDataByDistrictQuery} from '../store/services/caseDataApi';
import {dateToISOString} from 'util/util';
import {
  PercentileDataByDay,
  useGetMultipleSimulationDataByNodeQuery,
  useGetPercentileDataQuery,
} from 'store/services/scenarioApi';
import {useTranslation} from 'react-i18next';
import {NumberFormatter} from 'util/hooks';
import LoadingContainer from './shared/LoadingContainer';

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
  const selectedScenario = useAppSelector((state) => state.dataSelection.scenario);
  const activeScenarios = useAppSelector((state) => state.dataSelection.activeScenarios);
  const dispatch = useAppDispatch();

  const {data: caseData, isFetching: caseDataFetching} = useGetCaseDataByDistrictQuery(
    {
      node: selectedDistrict,
      groups: ['total'],
      compartments: [selectedCompartment ?? ''],
    },
    {skip: !selectedCompartment}
  );

  const {data: simulationData, isFetching: simulationFetching} = useGetMultipleSimulationDataByNodeQuery(
    {
      ids: activeScenarios ? activeScenarios : [],
      node: selectedDistrict,
      groups: ['total'],
      compartments: [selectedCompartment ?? ''],
    },
    {skip: !selectedCompartment}
  );

  const {data: percentileData} = useGetPercentileDataQuery(
    {
      id: selectedScenario as number,
      node: selectedDistrict,
      groups: ['total'],
      compartment: selectedCompartment as string,
    },
    {skip: !selectedScenario || !selectedCompartment}
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

    // Add series for case data
    const caseDataSeries = chart.series.push(new am4charts.LineSeries());
    caseDataSeries.dataFields.valueY = 'caseData';
    caseDataSeries.dataFields.dateX = 'date';
    caseDataSeries.id = 'caseData';
    caseDataSeries.strokeWidth = 2;
    caseDataSeries.fill = am4core.color('black');
    caseDataSeries.stroke = am4core.color('black');
    caseDataSeries.name = t('chart.caseData');

    const percentileSeries = chart.series.push(new am4charts.LineSeries());
    percentileSeries.dataFields.valueY = 'percentileUp';
    percentileSeries.dataFields.openValueY = 'percentileDown';
    percentileSeries.dataFields.dateX = 'date';
    percentileSeries.id = 'percentiles';
    percentileSeries.strokeWidth = 0;
    percentileSeries.fillOpacity = 0.3;

    // Add series for scenarios
    Object.entries(scenarioList.scenarios).forEach(([scenarioId, scenario], i) => {
      const series = chart.series.push(new am4charts.LineSeries());
      series.dataFields.valueY = scenarioId;
      series.dataFields.dateX = 'date';
      series.id = scenarioId;
      series.strokeWidth = 2;
      series.fill = am4core.color(theme.custom.scenarios[i % theme.custom.scenarios.length][0]); // loop around the color list if scenarios exceed color list
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
        series.fill = am4core.color(theme.custom.scenarios[i % theme.custom.scenarios.length][0]); // loop around the color list if scenarios exceed color list
        series.stroke = series.fill;
        // override tooltip
        series.tooltipText = `${scenario.label}: [bold]{${scenarioId}STDdown} ~ {${scenarioId}STDup}[/]`;
      }
    });

    // To export this chart
    chart.exporting.menu = new am4core.ExportMenu();
    chart.exporting.dataFields = {
      date: 'Date',
      rki: 'RKI',
      '1': 'Scenario 1',
      '2': 'Scenario 2',
      percentileUp: 'PercentileUp',
      percentileDown: 'PercentileDown',
    };
    chart.exporting.filePrefix = 'Covid Simulaton Data';

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

  //Effect to hide disabled scenarios (and show them again if not hidden anymore)
  useEffect(() => {
    const allSeries = chartRef.current?.series;
    if (allSeries) {
      allSeries.each((series) => {
        if (scenarioList.scenarios[+series.id] && !activeScenarios?.includes(+series.id)) {
          series.hide();
        } else {
          series.show();
        }
      });
    }
  }, [scenarioList.scenarios, activeScenarios]);

  //effect to hide deviations if no scenario is selected
  useEffect(() => {
    const allSeries = chartRef.current?.series;
    if (allSeries) {
      allSeries.each((series) => {
        if (series.id == 'percentiles') {
          if (selectedScenario) {
            series.show();
          } else {
            series.hide();
          }
        }
      });
    }
  }, [selectedScenario]);

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
      try {
        const ranges = chartRef.current?.xAxes.getIndex(0)?.axisRanges;
        ranges?.values.forEach((range) => {
          ranges.removeValue(range);
        });
      } catch (e) {
        console.error(e);
      }
    };
  }, [scenarioList, selectedDate, theme, t, i18n.language]);

  // Effect to update Simulation and case data
  useEffect(() => {
    if (
      chartRef.current &&
      simulationData &&
      simulationData.length > 1 &&
      selectedCompartment &&
      percentileData &&
      selectedScenario
    ) {
      // clear data
      chartRef.current.data = [];

      // create map to match dates
      const dataMap = new Map<string, {[key: string]: number}>();

      // cycle through scenarios
      activeScenarios?.forEach((scenarioId) => {
        if (simulationData[scenarioId]) {
          simulationData[scenarioId].results.forEach(({day, compartments}) => {
            dataMap.set(day, {...dataMap.get(day), [scenarioId]: compartments[selectedCompartment]});
          });
        }
      });

      // add case data values
      caseData?.results.forEach((entry) => {
        dataMap.set(entry.day, {...dataMap.get(entry.day), caseData: entry.compartments[selectedCompartment]});
      });

      //add 25th percentile data
      percentileData[0].results?.forEach((entry: PercentileDataByDay) => {
        dataMap.set(entry.day, {...dataMap.get(entry.day), percentileDown: entry.compartments[selectedCompartment]});
      });

      //add 75th percentile data
      percentileData[1].results?.forEach((entry: PercentileDataByDay) => {
        dataMap.set(entry.day, {...dataMap.get(entry.day), percentileUp: entry.compartments[selectedCompartment]});
      });

      //change fill color of percentile series to selected scenario color
      const percentileSeries = chartRef.current.map.getKey('percentiles') as am4charts.LineSeries;
      if (
        percentileSeries.fill !==
        am4core.color(theme.custom.scenarios[(selectedScenario - 1) % theme.custom.scenarios.length][0])
      ) {
        percentileSeries.fill = am4core.color(
          theme.custom.scenarios[(selectedScenario - 1) % theme.custom.scenarios.length][0]
        );
      }

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
            if (
              s.dataFields.valueY &&
              data &&
              (data as {[key: string]: number | string})[s.dataFields.valueY] &&
              s.id !== 'percentiles'
            ) {
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
              if (
                s.id == scenarioList.scenarios[selectedScenario].id.toString() &&
                percentileSeries.dataFields.openValueY &&
                percentileSeries.dataFields.valueY
              ) {
                text.push(
                  `<td>[${formatNumber((data as {[key: string]: number})[percentileSeries.dataFields.openValueY])} - 
                    ${formatNumber((data as {[key: string]: number})[percentileSeries.dataFields.valueY])}]</td>`
                );
              } else {
                text.push('<td/>');
              }
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
  }, [
    activeScenarios,
    selectedScenario,
    percentileData,
    simulationData,
    caseData,
    scenarioList,
    selectedCompartment,
    theme,
    formatNumber,
    t,
  ]);

  return (
    <LoadingContainer
      sx={{width: '100%', height: '100%'}}
      show={caseDataFetching || simulationFetching}
      overlayColor={theme.palette.background.paper}
    >
      <Box
        id='chartdiv'
        sx={{
          height: 'calc(100% - 4px)',
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
