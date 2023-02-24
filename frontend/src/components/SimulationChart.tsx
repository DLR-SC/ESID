import React, {useEffect, useRef, useState} from 'react';
import * as am5 from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';
import * as am5export from '@amcharts/amcharts5/plugins/exporting';
/**/import * as am4core from '@amcharts/amcharts4/core';
/**/import * as am4charts from '@amcharts/amcharts4/charts';
/**/import am4lang_en_US from '@amcharts/amcharts4/lang/en_US';
/**/import am4lang_de_DE from '@amcharts/amcharts4/lang/de_DE';
import am5locales_en_US from '@amcharts/amcharts5/locales/en_US';
import am5locales_de_DE from '@amcharts/amcharts5/locales/de_DE';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {useTheme} from '@mui/material/styles';
import Box from '@mui/material/Box';
import {selectDate} from '../store/DataSelectionSlice';
import {useGetCaseDataByDistrictQuery} from '../store/services/caseDataApi';
import {dateToISOString} from 'util/util';
import {
  PercentileDataByDay,
  SelectedScenarioPercentileData,
  useGetMultipleSimulationDataByNodeQuery,
  useGetPercentileDataQuery,
} from 'store/services/scenarioApi';
import {useTranslation} from 'react-i18next';
import {NumberFormatter} from 'util/hooks';
import LoadingContainer from './shared/LoadingContainer';
import {useGetMultipleGroupFilterDataQuery} from 'store/services/groupApi';
import {GroupData} from 'types/group';
import {Scenario} from 'store/ScenarioSlice';
import DOMPurify from 'dompurify';

/** Interface for an scenario entry in the series map containing the am5 chart indices */
interface seriesMapEntry {
  /** Groups of a scenario with their name as key ('total' as the default group) */
  [group: string | 'total']: {
    /** Compartment of a group of a scenario with name as key and series index as value */
    [compartment: string]: {
      /** Index of the mean value series */
      mean?: number;
      /** Index of the percentiles series */
      percentiles?: number;
    }
  }
}

/** Interface for a data entry in the data map */
interface dataMapEntry {
  /** Contains Case data */
  caseData?: {
    /** Compartment values with compartment name and value */
    [compartment: string]: number
  },
  /** Contains all scenarios of the data */
  scenarios?: {
    /** Scenario data with Scenario ID as key */
    [scenarioID: string]: {
      /** Group data with group name as key ('total' as the default data group) */
      [group: string]: {
        /** Compartment values with compartment name as key */
        [compartment: string]: {
          /** Value of the compartment (of the group of the scenario) */
          value?: number,
          /** Upper percentile (75%) of the compartment value (if available) */
          percentileUp?: number,
          /** Lower percentile (25%) of the compartment value (if available) */
          percentileDown?: number
        }
      }
    }
  }
}

/* This component displays the evolution of the pandemic for a specific compartment (hospitalized, dead, infected, etc.) regarding the different scenarios
 */

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
  const groupFilterList = useAppSelector((state) => state.dataSelection.groupFilters);
  const dispatch = useAppDispatch();

  const {data: groupFilterData} = useGetMultipleGroupFilterDataQuery(
    groupFilterList && selectedScenario && selectedDistrict && selectedCompartment
      ? Object.values(groupFilterList)
          .filter((groupFilter) => groupFilter.isVisible)
          .map((groupFilter) => {
            return {
              id: selectedScenario,
              node: selectedDistrict,
              compartment: selectedCompartment,
              groupFilter: groupFilter,
            };
          })
      : []
  );

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
  
  const chartRef = useRef<am5xy.XYChart | null>(null);
  const rootRef = useRef<am5.Root | null>(null);
  
  // Map to access series via id (returns index of chart series array)
  // The key is 'caseData'|scenarioIDs and values are map entry objects with indices of compartments of groups|'total'
  const [seriesMap, setSeriesMap] = useState<Map<string | 'caseData', seriesMapEntry>>(new Map<string | 'caseData', seriesMapEntry>());

  // Map containing the merged and sorted data
  // The key is the day and values are compartment values of groups of scenarios for that day
  const [dataMap, setDataMap] = useState<Map<string, dataMapEntry>>(new Map<string, dataMapEntry>());


  // Effect to populate & update the data map when case data changes
  useEffect(() => {
    // Make sure case data exists
    if (!caseData) { return }
    
    // Functional update for the data map
    setDataMap((previousMap) => {
      // Flag to check if new entries were added and map need sorting
      let isSorted = true;

      // Go through case data and add it to data map
      caseData.results.forEach(({day, compartments}) => {
        // If day is not in data map, set flag to sort map again
        if (!previousMap.has(day)) { isSorted = false }
        // Compose data map addition
        const item: dataMapEntry = {
          caseData: compartments
        }
        // Add entry to data map
        previousMap.set(day, {...(previousMap.get(day) as dataMapEntry), ...item})
      });
      
      // Sort map if entries were added
      if (!isSorted) {
        previousMap = new Map(Array.from(previousMap).sort(([a], [b]) => String(a).localeCompare(b)));
      }
      
      // Return modified map
      return previousMap;
    });

    // Clean-up function to delete old case data
    return () => {
      setDataMap((previousMap) => {
        // Remove case data part from data map
        return new Map(Array.from(previousMap).map(([day, mapEntry]) => {
          delete mapEntry.caseData;
          return [day, mapEntry];
        }));
      });
    }
    // Only run when case data changes (setDataMap should not change during runtime)
  }, [caseData, setDataMap]);


  // Effect to populate & update the data map when simulation data or percentile data changes
  // Handle sim data and percentile data together in case api requests will be merged together later
  // Clean-up easier if handled together
  useEffect(() => {
    // Make sure simulation & percentile data exist
    if (!simulationData || !percentileData) { return }
    
    // Functional update for the data map
    setDataMap((previousMap) => {
      // Flag to check if new entries were added and map needs sorting
      let isSorted = true;

      // Go through scenarios in simulation data
      simulationData.forEach((data, scenarioID) => {
        // Go through scenario data
        data.results.forEach(({day, compartments}) => {
          // If day is not in data map, set flag to sort map again
          if (!previousMap.has(day)) { isSorted = false }
          // Compose data map addition
          const item: dataMapEntry = {
            scenarios: {
              // Convert scenario ID to string
              [`${scenarioID}`]: {
                // Select 'total' group for data
                ['total']:
                  // Go through compartments and move them into single object matching dataMapEntry structure
                  Object.entries(compartments).reduce<{[compartment: string]: {value: number}}>((prev, [compartmentName, value]) => {
                    // Add compartment to return object
                    return {
                      ...prev,
                      [compartmentName]: {
                        value: value
                      }
                    };
                  }, {})
              }
            }
          };
          // Upsert entry into data map
          // if entry exists, merge object else just use created item
          previousMap.set(day, {...previousMap.get(day) ?? {}, ...item});
        });
      });

      // Go through percentile data (25th percentile [0], 75th percentile [1]) (both are same size)
      percentileData[0].results?.forEach(({compartments, day}, idx) => {
        // If day is not in data map, set flag to sort map again
        if (!previousMap.has(day)) { isSorted = false }
        // Compose data map addition
        const item: dataMapEntry = {
          scenarios: {
            // convert selected scenario ID to string (percentile data currently only has selected scenario)
            [`${selectedScenario}`]: {
              // Select 'total' group for data
              ['total']:
                // Go through compartments and move them into single object matching dataMapEntry structure
                Object.entries(compartments).reduce<{[compartment: string]: {percentileUp: number, percentileDown: number}}>((prev, [compartmentName, valueDown]) => {
                  // Add compartment values to return object
                  return {
                    ...prev,
                    [compartmentName]: {
                      // add percentile up (75th) from other result based on index
                      percentileUp: (percentileData[1].results as PercentileDataByDay[])[idx].compartments[compartmentName],
                      percentileDown: valueDown
                    }
                  };
                }, {})
            }
          }
        };

        // Upsert entry into data map
        // if entry exists, merge object else just use created item
        previousMap.set(day, {...previousMap.get(day) ?? {}, ...item})
      });
      
      // Sort map if entries were added
      if (!isSorted) {
        previousMap = new Map(Array.from(previousMap).sort(([a], [b]) => String(a).localeCompare(b)));
      }

      // Return modified map
      return previousMap;
    });

    // Return Clean-up function to delete old data
    return () => {
      setDataMap((previousMap) => {
        // Remove scenario data part from data map
        return new Map(Array.from(previousMap).map(([day, mapEntry]) => {
          delete mapEntry.scenarios;
          return [day, mapEntry];
        }));
      });
    }

    // Only run when simulation data changes (setDataMap should not change during runtime)
  }, [simulationData, setDataMap]);


  // Effect to Init Chart
  useEffect(() => {
    // Create Root & Chart instance
    const root = am5.Root.new('chartdiv_am5');
    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        cursor: am5xy.XYCursor.new(root, {
          behavior: 'zoomX',
        }),
        maxTooltipDistance: -1
      })
    );
    // Set localization
    root.locale = i18n.language === 'de' ? am5locales_de_DE : am5locales_en_US;

    // Create axes
    const xAxis = chart.xAxes.push(
      am5xy.DateAxis.new(root, {
        renderer: am5xy.AxisRendererX.new(root, {}),
        baseInterval: {
          timeUnit: 'day',
          count: 1
        },
        gridIntervals: [
          { timeUnit: "day", count: 1 },
          { timeUnit: "day", count: 2 },
          { timeUnit: "day", count: 3 },
          { timeUnit: "day", count: 4 },
          { timeUnit: "day", count: 5 },
          { timeUnit: "week", count: 1 },
          { timeUnit: "month", count: 1 },
          { timeUnit: "month", count: 2 },
          { timeUnit: "month", count: 3 },
          { timeUnit: "month", count: 6 },
          { timeUnit: "year", count: 1 },
        ],
        tooltip: am5.Tooltip.new(root, {})
      })
    );
    // TODO const yAxis = 
    chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererX.new(root, {}),
        min: 0,
        strictMinMax: true
      })
    );

    // Add date selection event handler for cursor
    am5.utils.addEventListener(root.dom, 'click', (e: MouseEvent) => {
      const localPoint = chart.plotContainer.toLocal({
        x: e.clientX,
        y: e.clientY
      });
      const date = xAxis.positionToDate(xAxis.coordinateToPosition(localPoint.x))
      // Convert to UTC timestamp
      date.setUTCFullYear(date.getFullYear());
      date.setUTCMonth(date.getMonth());
      date.setUTCDate(date.getDate());
      dispatch(selectDate(dateToISOString(date)));
    });

    // Store refs
    rootRef.current = root;
    chartRef.current = chart;

    // Return cleanup function
    return () => {
      chartRef.current && chartRef.current.dispose();
      rootRef.current && rootRef.current.dispose();
    };
    // Init should not rerun (dispatch or language should not change during use)
  }, [dispatch, i18n.language]);

// TODO

  // Effect to setup case data series
  useEffect(() => {
    // Only run if chart is set up (no cleanup needed)
    if (!chartRef.current || !rootRef.current) { return }

    // Add series to chart
    const caseDataSeries = chartRef.current.series.push(
      am5xy.LineSeries.new(rootRef.current, {
        name: t('chart.caseData'),
        xAxis: chartRef.current.xAxes.getIndex(0) as am5xy.DateAxis<am5xy.AxisRenderer>,
        yAxis: chartRef.current.yAxes.getIndex(0) as am5xy.ValueAxis<am5xy.AxisRenderer>,
        valueYField: 'caseData',
        valueXField: 'date',
        id: 'caseData',
        stroke: am5.color('#000'),
        fill: am5.color('#000'),
      })
    );
    caseDataSeries.strokes.template.setAll({
      strokeWidth: 2,
    });

    // Upsert index into series map
    setSeriesMap((prev) => {
      // Compose new entry
      const item: seriesMapEntry = {
        'total': {
          [selectedCompartment as string]: {
            mean: chartRef.current?.series.indexOf(caseDataSeries) as number
          }
        }
      }
      // Append entry into map
      return new Map(prev).set('caseData', {...prev.get('caseData'), ...item});
    });

    // Add data from data map to series
    caseDataSeries.data.setAll(
      // Create array out of data map values (data map is already chronologically sorted by data update effect)
      Array.from(dataMap.entries()).map(([day, mapEntry]) => {
        return {
          date: day,
          caseData: mapEntry.caseData[selectedCompartment as string]
        }
      })
    );

    // Return cleanup function
    return () => {
      // No cleanup if chart or series map not set up
      if (!chartRef.current) { return }
      // Remove case data series from chart and series map
      setSeriesMap((prev) => {
        // cleanup only needed if there are indices to remove
        if (prev.get('caseData')) {
          // go through map and remove any indices and their series
          Object.values((prev.get('caseData') as seriesMapEntry)['total']).forEach(({mean: seriesIdx}) => {
            chartRef.current?.series.removeIndex(seriesIdx as number);
          });
          // remove case data map entry
          const newState = new Map(prev);
          newState.delete('caseData');
          return newState;
        }
        // do nothing if case data index not set on series map
        else {
          return prev;
        }
      });
    };
    // This should rerun every time the data changes or the compartment
  }, [dataMap, selectedCompartment]);


  // Effect to setup percentiles series
  useEffect(() => {
    // Only run if chart is set up (no cleanup needed)
    if (!chartRef.current || !rootRef.current) { return }
    
    // Add series for percentile data
    const percentileSeries = chartRef.current.series.push(
      am5xy.LineSeries.new(rootRef.current, {
        id: 'percentiles',
        xAxis: chartRef.current.xAxes.getIndex(0) as am5xy.DateAxis<am5xy.AxisRenderer>,
        yAxis: chartRef.current.yAxes.getIndex(0) as am5xy.ValueAxis<am5xy.AxisRenderer>,
        valueXField: 'date',
        valueYField: 'percentileUp',
        openValueYField: 'percentileDown'
      })
    );
    percentileSeries.strokes.template.setAll({
      strokeWidth: 0,
      fillOpacity: 0.3
    });

    // Upsert index into series map
    setSeriesMap((prev) => {
      // Compose new entry
      const item: seriesMapEntry = {
        'total': {
          [selectedCompartment as string]: {
            percentiles: chartRef.current?.series.indexOf(percentileSeries) as number
          }
        }
      }
      // Append entry into map & merge entry with existing entry
      return new Map(prev).set(`${selectedScenario}`, {...prev.get(`${selectedScenario}`), ...item});
    });

    // Add Data
    // Make sure data is set and compartment selected 
    if (percentileData && selectedCompartment) {
      const dataMap = new Map<string, {[key: string]: number}>();
      // Clear data (just in case)
      percentileSeries.data.setAll([]);
      // Add percentileDown
      percentileData[0].results?.forEach((entry) => {
        dataMap.set(entry.day,{
          percentileDown: entry.compartments[selectedCompartment],
        })
      });
      // Add percentileUp
      percentileData[1].results?.forEach((entry) => {
        dataMap.set(entry.day,{
          percentileUp: entry.compartments[selectedCompartment],
        })
      });
      // Push data into series
      percentileSeries.data.push(Object.keys(dataMap).map((day) => {
        return {
          date: day,
          percentileUp: (dataMap.get(day) as {percentileDown: number, percentileUp: number})['percentileUp'],
          percentileDown: (dataMap.get(day) as {percentileDown: number, percentileUp: number})['percentileDown']
        }
      }));
    }

    // CLARIFY why needed? when unselected? when all deactivated?
    // hide if no scenario is selected
    if (selectedScenario) {
      percentileSeries.show();
    } else {
      percentileSeries.hide();
    }

    // Return cleanup function
    return () => {
      // No cleanup if chart or series map not set up
      if (!chartRef.current || !seriesMap.percentiles) { return }
      // Remove case data series from chart and series map
      chartRef.current?.series.removeIndex(seriesMap.percentiles);
      delete seriesMap.percentiles;
    };
    // This should rerun every time the percentile data changes (or the scenario changes)
  }, [percentileData, selectedCompartment]);


  // Effect to setup scenario series
  // TODO series map to functional update
  useEffect(() => {
    // Only run if chart is set up (no cleanup needed)
    if (!chartRef.current || !rootRef.current) { return }

    // Only run if there are active scenarios
    if (activeScenarios) {
      // Go through available scenarios
      activeScenarios.forEach(scenarioId => {
      const scenario: Scenario = scenarioList.scenarios[scenarioId];

      // Repeat guard because lint gets weird with type | undefined otherwise (assertion above does not register in nested blocks)
      if (!chartRef.current || !rootRef.current) { return }
      // Set up series
      const series = chartRef.current.series.push(
        am5xy.LineSeries.new(rootRef.current as am5.Root, {
          id: `${scenario.id}`,
          xAxis: chartRef.current.xAxes.getIndex(0) as am5xy.DateAxis<am5xy.AxisRenderer>,
          yAxis: chartRef.current.yAxes.getIndex(0) as am5xy.ValueAxis<am5xy.AxisRenderer>,
          valueXField: 'date',
          valueYField: `${scenarioId}`,
          name: scenario.label,
          // Loop around the color list if scenario id exceeds color list length
          fill: am5.color(theme.custom.scenarios[scenarioId % theme.custom.scenarios.length][0]),
          stroke: am5.color(theme.custom.scenarios[scenarioId % theme.custom.scenarios.length][0]),
          tooltipText: `[bold ${theme.custom.scenarios[scenarioId % theme.custom.scenarios.length][0]}]${scenario.label}:[/] {${scenarioId}}`
        })
      );
      series.strokes.template.setAll({
        strokeWidth: 2
      });

      // Add index to map
      setSeriesMap({[scenarioId]: chartRef.current.series.indexOf(series), ...seriesMap});
      // Make sure index is correct
      if (!seriesMap[scenarioId] || seriesMap[scenarioId] === -1) {
        console.error(`Series Map Error: scenario id "${scenarioId}" series index could not be set (undefined or indexOf returned -1)!`);
      }

      // Make sure simulation data is ready and contains scenario and compartment is selected
      if (simulationData && simulationData[scenarioId] && selectedCompartment) {
        // Replace data with current data
        series.data.setAll(
          simulationData[scenarioId].results.map(({day, compartments}) => {
            return {
              date: day,
              [scenarioId]: compartments[selectedCompartment]
            }
          })
        );
      }
    });
    }
    // Return cleanup function
    return () => {
      // No cleanup if chart not set up
      if (!chartRef.current) { return }
      // Remove scenario series from chart
      Object.keys(scenarioList.scenarios).forEach((scenarioId) => {
        if (seriesMap[scenarioId]) {
          chartRef.current?.series.removeIndex(seriesMap[scenarioId]);
          delete seriesMap[scenarioId];
        }
      })
    };
  // This should rerun every time the scenario data changes
  }, [simulationData, selectedCompartment, activeScenarios]);


  // Effect to set up export menu
  useEffect(() => {
    // Only run if chart is set up (no cleanup needed)
    if (!rootRef.current || !chartRef.current) { return }

    // Create export menu
    am5export.Exporting.new(rootRef.current, {
      menu: am5export.ExportingMenu.new(rootRef.current, {
        align: 'right',
        valign: 'top'
      }),
      filePrefix: 'ESID_export',
      dataSource: [caseData, simulationData, percentileData],
      dateFields: ['date'],
      dateFormat: t('dateFormat'),
      dataFields: {
        date: t('export.date'),
        caseData: t('chart.caseData'),
        percentileUp: `75. ${t('export.percentile')}`,
        percentileDown: `25. ${t('export.percentile')}`,
        // Go through active scenarios and add them as properties
        ...activeScenarios?.reduce((previousResult, scenarioId) => {
          return {
            ...previousResult,
            [scenarioId]: `${t('export.scenario')} "${scenarioList.scenarios[scenarioId].label}"`
          }
        }, {})
      },
      dataFieldsOrder: ['date', 'caseData', 'percentileUp', 'percentileDown'],
    });

  // This should rerun every time the data changes
  }, [caseData, simulationData, percentileData]);


  // Effect to set up tooltip
  useEffect(() => {
    // Only run if chart is set up (no cleanup needed)
    if (!rootRef.current || !chartRef.current) { return }

    chartRef.current.series.each((series) => {
      // Add tooltip adapter to each series
      series.adapters.add('tooltipHTML', (_, target) => {
        // Get date from tooltip data context
        const day = (target.dataItem?.dataContext as {[key: string]: number | string})['date'] as string

        // Init tooltip with first line (date & selected compartment)
        const text = [`<strong>{date.formatDate("${t('dateFormat')}")} (${selectedCompartment})</strong>`];
        // Begin table
        text.push('<table>');
        // Set case data row & make sure it has a value for tooltip day
        const cdSeries = chartRef.current?.series.getIndex(seriesMap['caseData']);
        const cdValue = (cdSeries?.data.values as {date: string, caseData: number}[]).find((value) => value.date === day)?.caseData
        if (cdValue) {
          text.push('<tr>');
          // Set styling, use stroke color (black as fallback)
          text.push(`<th style='text-align:left; color:${cdSeries?.get('stroke')?.toCSSHex() ?? '#000'}; padding-right:${theme.spacing(2)}'>`);
          // Set name as table header
          text.push(`<strong>${t('chart.caseData')}</strong>`);
          text.push('</th>');
          // Set case data value
          text.push(`<td style:'text-align:right'>`);
          text.push(`${formatNumber(cdValue)}`);
          text.push(`</td>`);
          text.push(`</tr>`);
        }
        // Go through scenarios to add them
        const {['caseData']: _throwaway1, ['percentiles']: _throwaway2, ...scenarios} = seriesMap


        
        return '';
      });
    });
    // Add tooltip to every series
    // DELETEME
    chartRef.current.series.each((series) => {
      // assemble tooltip text
      series.adapters.add('tooltipHTML', (_, target) => {
        const data = target.dataItem?.dataContext;
        const text = [`<strong>{date.formatDate("${t('dateFormat')}")} (${selectedCompartment})</strong>`];

        text.push('<table>');
        // add series info
        chartRef.current?.series.each((s) => {
          // add series entry, skip percentiles series
          if (s.get('id') === 'percentiles') { return }
          text.push('<tr>');
          // table head (series name)
          text.push(
            `<th style='text-align:left; color:${s.get('stroke')?.toCSSHex() ?? '#FFF'}; padding-right:${theme.spacing(2)}'>
            <strong>${DOMPurify.sanitize(s.get('name')??'ERROR: NO NAME')}</strong>
            </th>`
          );
          // selected compartment value for series
          text.push(
            `<td style='text-align:right'>
            ${formatNumber((data as {[key: string]: number})[s.get('valueYField') as string])}
            </td>`
          );
          // add percentiles if selected scenario
          if (s.get('id') === scenarioList.scenarios[selectedScenario as number].id.toString()) {
            text.push(
              `<td>
              [${formatNumber(0)} - ${formatNumber(0)}]
              </td>`
            );
          }
        });
        return text.join('\n');
      });
    });
  // TODO when should this run?
  }, [])

  // DELETEME AM4 EFFECT
  useEffect(() => {
    // Create chart instance
    const chart_am4 = am4core.create('chartdiv', am4charts.XYChart);

    // Set localization
    chart_am4.language.locale = i18n.language === 'de' ? am4lang_de_DE : am4lang_en_US;

    // Create axes
    const dateAxis_am4 = chart_am4.xAxes.push(new am4charts.DateAxis());
    const valueAxis_am4 = chart_am4.yAxes.push(new am4charts.ValueAxis());
    valueAxis_am4.min = 0;

    // Add cursor
    chart_am4.cursor = new am4charts.XYCursor();
    chart_am4.cursor.xAxis = dateAxis_am4;

    const caseDataSeries_am4 = chart_am4.series.push(new am4charts.LineSeries());
    caseDataSeries_am4.dataFields.valueY = 'caseData';
    caseDataSeries_am4.dataFields.dateX = 'date';
    caseDataSeries_am4.id = 'caseData';
    caseDataSeries_am4.strokeWidth = 2;
    caseDataSeries_am4.fill = am4core.color('black');
    caseDataSeries_am4.stroke = am4core.color('black');
    caseDataSeries_am4.name = t('chart.caseData');

    const percentileSeries_am4 = chart_am4.series.push(new am4charts.LineSeries());
    percentileSeries_am4.dataFields.valueY = 'percentileUp';
    percentileSeries_am4.dataFields.openValueY = 'percentileDown';
    percentileSeries_am4.dataFields.dateX = 'date';
    percentileSeries_am4.id = 'percentiles';
    percentileSeries_am4.strokeWidth = 0;
    percentileSeries_am4.fillOpacity = 0.3;
    
    // Add series for scenarios
    Object.entries(scenarioList.scenarios).forEach(([scenarioId, scenario], i) => {
      const series_am4 = chart_am4.series.push(new am4charts.LineSeries());
      series_am4.dataFields.valueY = scenarioId;
      series_am4.dataFields.dateX = 'date';
      series_am4.id = scenarioId;
      series_am4.strokeWidth = 2;
      series_am4.fill = am4core.color(theme.custom.scenarios[i % theme.custom.scenarios.length][0]); // loop around the color list if scenarios exceed color list
      series_am4.stroke = series_am4.fill;
      series_am4.tooltipText = `[bold ${series_am4.stroke.hex}]${scenario.label}:[/] {${scenarioId}}`;
      series_am4.name = scenario.label;
    });

    chart_am4.exporting.menu = new am4core.ExportMenu();
    chart_am4.exporting.dataFields = {
      date: 'Date',
      rki: 'RKI',
      '1': 'Scenario 1',
      '2': 'Scenario 2',
      percentileUp: 'PercentileUp',
      percentileDown: 'PercentileDown',
    };
    chart_am4.exporting.filePrefix = 'Covid Simulaton Data';

    // Add series for groupFilter
    if (groupFilterList && selectedScenario) {
      const groupFilterStrokes = ['2,4', '8,4', '8,4,2,4'];
      Object.values(groupFilterList)
        .filter((groupFilter) => groupFilter.isVisible)
        .forEach((groupFilter, i) => {
          const series = chart.series.push(new am4charts.LineSeries());
          series.dataFields.valueY = groupFilter.name;
          series.dataFields.dateX = 'date';
          series.id = 'group-filter-' + groupFilter.name;
          series.strokeWidth = 2;
          series.fill = am4core.color(
            theme.custom.scenarios[(selectedScenario - 1) % theme.custom.scenarios.length][0]
          );
          series.stroke = series.fill;
          if (i < groupFilterStrokes.length) {
            series.strokeDasharray = groupFilterStrokes[i];
          }
          series.tooltipText = `[bold ${series.stroke.hex}]${groupFilter.name}:[/] {${i}}`;
          series.name = groupFilter.name;
        });
    }

    // add date selection event handler
    chart_am4.events.on('hit', () => {
      // Timezone shenanigans could get us the wrong day ...
      const date = new Date(dateAxis_am4.tooltipDate);
      date.setUTCFullYear(date.getFullYear());
      date.setUTCMonth(date.getMonth());
      date.setUTCDate(date.getDate());
      dispatch(selectDate(dateToISOString(date)));
    });

    chartRef_am4.current = chart_am4;
    return () => {
      chartRef_am4.current?.dispose();
    };
  }, [scenarioList, groupFilterList, dispatch, i18n.language, t, theme, caseData, percentileData, simulationData, selectedScenario]);

  // DELETEME Effect to hide disabled scenarios (and show them again if not hidden anymore)
  useEffect(() => {
    const allSeries = chartRef_am4.current?.series;
    if (allSeries) {
      allSeries.each((series) => {
        if (scenarioList.scenarios[+(series.id/* FIXME get('id') as string*/)] && !activeScenarios?.includes(+(series.id/* FIXME get('id') as string*/))) {
          series.hide();
        } else {
          series.show();
        }
      });
    }
  }, [scenarioList.scenarios, activeScenarios]);

  // DELETEME Effect to hide deviations if no scenario is selected
  useEffect(() => {
    const allSeries = chartRef_am4.current?.series;
    if (allSeries) {
      allSeries.each((series) => {
        if (series.id === 'percentiles') {
          if (selectedScenario) {
            series.show();
          } else {
            series.hide();
          }
        }
      });
    }
  }, [selectedScenario]);

  // TODO: Effect to add Guide when date selected
  useEffect(() => {
    if (chartRef_am4.current && selectedDate) {
      const dateAxis_am4 = chartRef_am4.current.xAxes.getIndex(0) as am4charts.DateAxis;
      const range = dateAxis_am4.axisRanges.create();
      range.date = new Date(selectedDate);
      range.grid.above = true;
      range.grid.stroke = am4core.color(theme.palette.primary.main);
      range.grid.strokeWidth = 2;
      range.grid.strokeOpacity = 1;
      range.label.text = '{date}';
      range.label.language.locale = dateAxis_am4.language.locale;
      range.label.dateFormatter.dateFormat = t('dateFormat');
      range.label.fill = am4core.color('white');
      range.label.background.fill = range.grid.stroke;
    }

    // remove old ranges before creating a new one
    return () => {
      try {
        const ranges = chartRef_am4.current?.xAxes.getIndex(0)?.axisRanges;
        ranges?.values.forEach((range) => {
          ranges.removeValue(range);
        });
      } catch (e) {
        console.error(e);
      }
    };
  }, [scenarioList, selectedDate, theme, t, i18n.language, groupFilterData]);

  // DELETEME Effect to update Simulation and case data
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
      chartRef.current.series.each((series) => {
        series.data.setAll([]);
      });

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

      // Add groupFilter data
      if (groupFilterList && groupFilterData) {
        Object.values(groupFilterList).forEach((groupFilter) => {
          if (groupFilter && groupFilter.isVisible) {
            if (groupFilterData[groupFilter.name]) {
              groupFilterData[groupFilter.name].results.forEach((entry: GroupData) => {
                dataMap.set(entry.day, {
                  ...dataMap.get(entry.day),
                  [groupFilter.name]: entry.compartments[selectedCompartment],
                });
              });
            }
          }
        });
      }

      //change fill color of percentile series to selected scenario color
      chartRef.current.series.each((series) => {
        
        if (
          // do nothing if series not percentiles
          series.get('id') === 'percentiles' &&
          // also do nothing if color already correct
          series.get('fill') !== am5.color(theme.custom.scenarios[(selectedScenario - 1) % theme.custom.scenarios.length][0])
        ) {
          // set correct fill color on percentiles
          series.setAll({
            fill: am5.color(theme.custom.scenarios[(selectedScenario - 1) % theme.custom.scenarios.length][0])
          })
        }
      })
      /**/const percentileSeries_am4 = chartRef_am4.current?.map.getKey('percentiles') as am4charts.LineSeries;
      /**/if (
      /**/  percentileSeries_am4.fill !==
      /**/  am4core.color(theme.custom.scenarios[(selectedScenario - 1) % theme.custom.scenarios.length][0])
      /**/) {
      /**/  percentileSeries_am4.fill = am4core.color(
      /**/    theme.custom.scenarios[(selectedScenario - 1) % theme.custom.scenarios.length][0]
      /**/  );
      /**/}

      // sort map by date
      const dataMapSorted = new Map(Array.from(dataMap).sort(([a], [b]) => String(a).localeCompare(b)));

      // push DataMap into chart data
      dataMapSorted.forEach((values, day) => {
        chartRef.current?.series.each((series) => {
          const series_id = series.get('id') as string
          switch (series_id) {
            case 'caseData':
              series.data.push({
                date: day,
                caseData: values['caseData']
              });
              break;
            case 'percentiles':
              series.data.push({
                date: day,
                percentileUp: values['percentileUp'],
                percentileDown: values['percentileDown']
              });
              break
            default: {
              // assume Scenario ID or irrelevant
              const series_scenario_id = parseInt(series_id)
              // break if not Scenario ID
              if (Number.isNaN(series_scenario_id)) { break; }
              const tmp: {[key: string]: number} = {}
              tmp[`${series_scenario_id}`] = values[`${series_scenario_id}`]
              series.data.push({
                date: day,
                ...tmp
              });
              break;
            }
          }
        })
        /**/chartRef_am4.current?.data.push({
        /**/  date: day,
        /**/  ...values,
        /**/});
      });

      // set up tooltip text
      /*
      chartRef.current?.series.each((series) => {
        // assemble tooltip text
        series.adapters.add('tooltipHTML', (_, target) => {
          const data = target.dataItem?.dataContext;
          const text = [`<strong>{date.formatDate("${t('dateFormat')}")} (${selectedCompartment})</strong>`];

          text.push('<table>');
          // add series info
          chartRef.current?.series.each((s) => {
            // add series entry, skip percentiles series
            if (s.get('id') === 'percentiles') { return }
            text.push('<tr>');
            // table head (series name)
            text.push(
              `<th style='text-align:left; color:${s.get('stroke')?.toCSSHex() ?? '#FFF'}; padding-right:${theme.spacing(2)}'>
              <strong>${DOMPurify.sanitize(s.get('name')??'ERROR: NO NAME')}</strong>
              </th>`
            );
            // selected compartment value for series
            text.push(
              `<td style='text-align:right'>
              ${formatNumber((data as {[key: string]: number})[s.get('valueYField') as string])}
              </td>`
            );
            // add percentiles if selected scenario
            if (s.get('id') === scenarioList.scenarios[selectedScenario].id.toString()) {
              text.push(
                `<td>
                [${formatNumber(0)} - ${formatNumber(0)}]
                </td>`
              );
            }
          });
          return text.join('\n');
        });
      });
      */

      chartRef_am4.current?.series.each((series) => {
        series.adapter.add('tooltipHTML', (_, target) => {
          const data = target.tooltipDataItem.dataContext;
          const text = [`<strong>{date.formatDate("${t('dateFormat')}")} (${selectedCompartment})</strong>`];
          text.push('<table>');
          chartRef_am4.current?.series.each((s) => {
            if (
              s.dataFields.valueY &&
              data &&
              (data as {[key: string]: number | string})[s.dataFields.valueY] &&
              s.id !== 'percentiles' &&
              !s.id.startsWith('group-filter-')
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
                percentileSeries_am4.dataFields.openValueY &&
                percentileSeries_am4.dataFields.valueY
              ) {
                text.push(
                  `<td>[${formatNumber((data as {[key: string]: number})[percentileSeries_am4.dataFields.openValueY])} - 
                    ${formatNumber((data as {[key: string]: number})[percentileSeries_am4.dataFields.valueY])}]</td>`
                );
                chartRef.current?.series.each((groupFilterSeries) => {
                  if (
                    groupFilterSeries.id.startsWith('group-filter-') &&
                    groupFilterSeries.dataFields.valueY &&
                    data &&
                    (data as {[key: string]: number | string})[groupFilterSeries.dataFields.valueY]
                  ) {
                    text.push('<tr>');
                    text.push(
                      `<th 
                         style='text-align:left; color:${
                           (groupFilterSeries.stroke as am4core.Color).hex
                         }; padding-right:${theme.spacing(2)}; padding-left:${theme.spacing(4)}'>
                       <strong>${groupFilterSeries.name}</strong>
                       </th>`
                    );
                    text.push(
                      `<td style='text-align:right'>${formatNumber(
                        (data as {[key: string]: number})[groupFilterSeries.dataFields.valueY]
                      )}</td>`
                    );
                    text.push(`</tr>`);
                  }
                });
              } else {
                text.push('<td/>');
                text.push('</tr>');
              }
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
      if(chartRef_am4.current){chartRef_am4.current.cursor.maxTooltipDistance = 0;}

      // invalidate/reload data
      chartRef_am4.current?.invalidateData();
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
    groupFilterList,
    formatNumber,
    t,
    groupFilterData,
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
          height: 'calc(50% - 4px)',
          margin: 0,
          padding: 0,
          backgroundColor: theme.palette.background.paper,
          backgroundImage: 'radial-gradient(#E2E4E6 10%, transparent 11%)',
          backgroundSize: '10px 10px',
          cursor: 'crosshair',
        }}
      />
      <Box
        id='chartdiv_am5'
        sx={{
          height: 'calc(50% - 4px)',
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
