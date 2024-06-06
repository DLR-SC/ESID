// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {useCallback, useEffect, useRef} from 'react';
import {Root} from '@amcharts/amcharts5/.internal/core/Root';
import {Tooltip} from '@amcharts/amcharts5/.internal/core/render/Tooltip';
import {RoundedRectangle} from '@amcharts/amcharts5/.internal/core/render/RoundedRectangle';
import {Color, color} from '@amcharts/amcharts5/.internal/core/util/Color';
import {DataProcessor} from '@amcharts/amcharts5/.internal/core/util/DataProcessor';
import {XYChart} from '@amcharts/amcharts5/.internal/charts/xy/XYChart';
import {DateAxis} from '@amcharts/amcharts5/.internal/charts/xy/axes/DateAxis';
import {AxisRendererX} from '@amcharts/amcharts5/.internal/charts/xy/axes/AxisRendererX';
import {ValueAxis} from '@amcharts/amcharts5/.internal/charts/xy/axes/ValueAxis';
import {AxisRendererY} from '@amcharts/amcharts5/.internal/charts/xy/axes/AxisRendererY';
import {XYCursor} from '@amcharts/amcharts5/.internal/charts/xy/XYCursor';
import {LineSeries} from '@amcharts/amcharts5/.internal/charts/xy/series/LineSeries';
import am5locales_en_US from '@amcharts/amcharts5/locales/en_US';
import am5locales_de_DE from '@amcharts/amcharts5/locales/de_DE';
import {darken, useTheme} from '@mui/material/styles';
import Box from '@mui/material/Box';
import {useTranslation} from 'react-i18next';
import {Dictionary, dateToISOString} from '../../util/util';
import React from 'react';
import {Scenario} from 'store/ScenarioSlice';
import {Localization} from 'types/localization';

interface ScenarioList {
  scenarios: {
    [key: number]: Scenario;
  };
  compartments: string[];
}
interface GroupFilter {
  id: string;
  name: string;
  isVisible: boolean;
  groups: Dictionary<string[]>;
}

interface LineChartProps {
  chartId?: string;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  setReferenceDayBottom?: (docPos: number) => void;
  simulationData?: ({day: string; value: number}[] | null)[] | null;
  simulationDataChartName: (scenario: Scenario) => string;
  caseData: {day: string; value: number}[] | undefined;
  percentileData?: {day: string; value: number}[][] | null;
  groupFilterData?: Dictionary<{day: string; value: number}[]> | null;
  minDate?: string | null;
  maxDate?: string | null;
  selectedScenario?: number | null;
  activeScenarios?: number[] | null;
  referenceDay?: string | null;
  selectedCompartment: string;
  scenarioList: ScenarioList;
  groupFilterList?: Dictionary<GroupFilter> | null;
  exportedFileName?: string;
  localization?: Localization;
}

export default function LineChart({
  chartId = 'chartdiv',
  selectedDate,
  setSelectedDate,
  setReferenceDayBottom = () => {},
  simulationData = null,
  caseData,
  simulationDataChartName,
  percentileData = null,
  groupFilterData = null,
  minDate = null,
  maxDate = null,
  selectedScenario = null,
  activeScenarios = null,
  referenceDay = null,
  selectedCompartment,
  scenarioList,
  groupFilterList = null,
  exportedFileName = 'Data',
  localization = {
    formatNumber: (value) => value.toLocaleString(),
    customLang: 'global',
    overrides: {},
  },
}: LineChartProps) {
  const {t: defaultT, i18n} = useTranslation();
  const {t: customT} = useTranslation(localization.customLang);
  const theme = useTheme();

  const rootRef = useRef<Root | null>(null);
  const chartRef = useRef<XYChart | null>(null);

  const setReferenceDayX = useCallback(() => {
    if (!chartRef.current || !rootRef.current || !referenceDay) {
      return;
    }

    const midday = new Date(referenceDay).setHours(12, 0, 0);

    const xAxis: DateAxis<AxisRendererX> = chartRef.current.xAxes.getIndex(0) as DateAxis<AxisRendererX>;
    const xAxisPosition = xAxis.width() * xAxis.toGlobalPosition(xAxis.dateToPosition(new Date(midday)));
    const globalPosition = xAxis.toGlobal({x: xAxisPosition, y: 0});
    const docPosition = rootRef.current.rootPointToDocument(globalPosition).x;
    setReferenceDayBottom(docPosition);
  }, [referenceDay, setReferenceDayBottom]);

  // Effect to initialize root & chart
  useEffect(
    () => {
      // Create root and chart
      const root = Root.new(chartId);
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

      // Create y-axis
      chart.yAxes.push(
        ValueAxis.new(root, {
          renderer: AxisRendererY.new(root, {}),
          // Fix lower end to 0
          min: 0,
          // Add tooltip instance so cursor can display value
          tooltip: Tooltip.new(root, {}),
        })
      );

      // Add cursor
      chart.set(
        'cursor',
        XYCursor.new(root, {
          // Only allow zooming along x-axis
          behavior: 'zoomX',
          // Snap cursor to xAxis ticks
          xAxis: xAxis,
        })
      );

      // Add event on double click to select date
      chart.events.on('click', (ev) => {
        // Get date from axis position from cursor position
        const date = xAxis.positionToDate(
          xAxis.toAxisPosition(ev.target.get('cursor')?.getPrivate('positionX') as number)
        );
        // Remove time information to only have a date
        date.setHours(0, 0, 0, 0);
        // Set date in store
        setSelectedDate(dateToISOString(date));
      });

      // Set refs to be used in other effects
      rootRef.current = root;
      chartRef.current = chart;

      // Clean-up before re-running this effect
      return () => {
        // Dispose old root and chart before creating a new instance
        chartRef.current?.dispose();
        rootRef.current?.dispose();
      };
    },
    // This effect should only run once. dispatch should not change during runtime
    [chartId, setSelectedDate]
  );

  // Effect to change localization of chart if language changes
  useEffect(
    () => {
      // Skip if root or chart is not initialized
      if (!rootRef.current || !chartRef.current) {
        return;
      }

      // Set localization
      rootRef.current.locale = i18n.language === 'de' ? am5locales_de_DE : am5locales_en_US;

      // Change date formats for ticks & tooltip (use fallback object to suppress undefined object warnings as this cannot be undefined)
      const xAxis: DateAxis<AxisRendererX> = chartRef.current.xAxes.getIndex(0) as DateAxis<AxisRendererX>;
      xAxis.get('dateFormats', {day: ''})['day'] =
        localization.overrides && localization.overrides['dayFormat']
          ? customT(localization.overrides['dayFormat'])
          : defaultT('dayFormat');
      xAxis.get('tooltipDateFormats', {day: ''})['day'] =
        localization.overrides && localization.overrides['dayFormat']
          ? customT(localization.overrides['dayFormat'])
          : defaultT('dayFormat');
      // Fix first date of the month falling back to wrong format (also with fallback object)
      xAxis.get('periodChangeDateFormats', {day: ''})['day'] =
        localization.overrides && localization.overrides['dayFormat']
          ? customT(localization.overrides['dayFormat'])
          : defaultT('dayFormat');
    },
    // Re-run effect if language changes
    [localization.customLang, defaultT, customT, localization.overrides, i18n.language]
  );

  // Effect to update min/max date.
  useEffect(() => {
    // Skip if root or chart is not initialized
    if (!rootRef.current || !chartRef.current || !minDate || !maxDate) {
      return;
    }

    const xAxis: DateAxis<AxisRendererX> = chartRef.current.xAxes.getIndex(0) as DateAxis<AxisRendererX>;
    xAxis.set('min', new Date(minDate).setHours(0));
    xAxis.set('max', new Date(maxDate).setHours(23, 59, 59));
  }, [minDate, maxDate]);

  // Effect to add series to chart
  useEffect(
    () => {
      // Skip if root or chart not initialized
      if (!rootRef.current || !chartRef.current) {
        return;
      }

      const chart: XYChart = chartRef.current;
      const root: Root = rootRef.current;
      const xAxis: DateAxis<AxisRendererX> = chart.xAxes.getIndex(0) as DateAxis<AxisRendererX>;
      const yAxis: ValueAxis<AxisRendererY> = chart.yAxes.getIndex(0) as ValueAxis<AxisRendererY>;

      // Add series for case data
      const caseDataSeries = chart.series.push(
        LineSeries.new(root, {
          xAxis: xAxis,
          yAxis: yAxis,
          // Case Data is always scenario id 0
          id: `${chartId}_0`,
          name:
            localization.overrides && localization.overrides['chart.caseData']
              ? customT(localization.overrides['chart.caseData'])
              : defaultT('chart.caseData'),
          valueXField: 'date',
          valueYField: '0',
          // Prevent data points from connecting across gaps in the data
          connect: false,
          stroke: color('#000'),
        })
      );
      caseDataSeries.strokes.template.setAll({
        strokeWidth: 2,
      });

      // Add series for percentile area
      const percentileSeries = chart.series.push(
        LineSeries.new(root, {
          xAxis: xAxis,
          yAxis: yAxis,
          id: `${chartId}_percentiles`,
          valueXField: 'date',
          valueYField: 'percentileUp',
          openValueYField: 'percentileDown',
          connect: false,
          // Percentiles are only visible if a scenario is selected and it is not case data
          visible: selectedScenario !== null && selectedScenario > 0,
          // Add fill color according to selected scenario (if selected scenario is set and it's not case data)
          fill:
            selectedScenario !== null && selectedScenario > 0
              ? color(theme.custom.scenarios[selectedScenario % theme.custom.scenarios.length][0])
              : undefined,
        })
      );
      percentileSeries.strokes.template.setAll({
        strokeWidth: 0,
      });
      percentileSeries.fills.template.setAll({
        fillOpacity: 0.3,
        visible: true,
      });

      // Add series for each scenario
      Object.entries(scenarioList.scenarios).forEach(([scenarioId, scenario]) => {
        const series = chart.series.push(
          LineSeries.new(root, {
            xAxis: xAxis,
            yAxis: yAxis,
            id: `${chartId}_${scenarioId}`,
            name: simulationDataChartName(scenario),
            valueXField: 'date',
            valueYField: scenarioId,
            // Prevent data points from connecting across gaps in the data
            connect: false,
            // Fallback Tooltip (if HTML breaks for some reason)
            // For text color: loop around the theme's scenario color list if scenario IDs exceed color list length, then pick first color of sub-palette which is the main color
            tooltip: Tooltip.new(root, {
              labelText: `[bold ${
                theme.custom.scenarios[scenario.id % theme.custom.scenarios.length][0]
              }]${simulationDataChartName(scenario)}:[/] {${scenarioId}}`,
            }),
            stroke: color(theme.custom.scenarios[scenario.id % theme.custom.scenarios.length][0]),
          })
        );
        series.strokes.template.setAll({
          strokeWidth: 2,
        });
      });

      // Add series for groupFilter (if there are any)
      if (groupFilterList && selectedScenario) {
        // Define line style variants for groups
        const groupFilterStrokes = [
          [2, 4], // dotted
          [8, 4], // dashed
          [8, 4, 2, 4], // dash-dotted
          [8, 4, 2, 4, 2, 4], // dash-dot-dotted
        ];
        // Loop through visible group filters
        Object.values(groupFilterList)
          .filter((groupFilter) => groupFilter.isVisible)
          .forEach((groupFilter, i) => {
            // Add series for each group filter
            const series = chart.series.push(
              LineSeries.new(root, {
                xAxis: xAxis,
                yAxis: yAxis,
                id: `${chartId}_group-filter-${groupFilter.name}`,
                name: groupFilter.name,
                valueXField: 'date',
                valueYField: groupFilter.name,
                connect: false,
                // Fallback Tooltip (if HTML breaks for some reason)
                // Use color of selected scenario (scenario ID is 1-based index, color list is 0-based index) loop if scenario ID exceeds length of color list; use first color of palette (main color)
                tooltip: Tooltip.new(root, {
                  labelText: `[bold ${theme.custom.scenarios[selectedScenario % theme.custom.scenarios.length][0]}]${
                    groupFilter.name
                  }:[/] {${groupFilter.name}}`,
                }),
                stroke: color(theme.custom.scenarios[selectedScenario % theme.custom.scenarios.length][0]),
              })
            );
            series.strokes.template.setAll({
              strokeWidth: 2,
              // Loop through stroke list if group filters exceeds list length
              strokeDasharray: groupFilterStrokes[i % groupFilterStrokes.length],
            });
          });
      }
      // Clean-up function
      return () => {
        // Remove all series
        chart.series.clear();
      };
    },
    // Re-run if scenario, group filter, or selected scenario (percentile series) change. (t, tBackend, and theme do not change during runtime).
    [
      scenarioList,
      groupFilterList,
      selectedScenario,
      defaultT,
      customT,
      theme,
      chartId,
      simulationDataChartName,
      localization.overrides,
    ]
  );

  // Effect to hide disabled scenarios (and show them again if not hidden anymore)
  useEffect(
    () => {
      const allSeries = chartRef.current?.series;
      // Skip effect if chart is not initialized (contains no series yet)
      if (!allSeries) return;

      // Set visibility of each series
      allSeries.each((series) => {
        // Everything but scenario series evaluate to NaN (because scenario series have their scenario id as series id while others have names)
        let seriesID = series.get('id');
        if (seriesID?.includes(chartId)) seriesID = seriesID.split('_')[1];
        // Hide series if it is a scenario series (and in the scenario list) but not in the active scenarios list
        if (seriesID === `percentiles`) {
          return;
        }

        if (!activeScenarios?.includes(Number(seriesID))) {
          void series.hide();
        } else {
          void series.show();
        }
      });
    },
    // Re-run effect when the active scenario list changes
    [activeScenarios, chartId]
  );

  // Effect to hide deviations if no scenario is selected
  useEffect(
    () => {
      // Skip effect if chart is not initialized (contains no series yet)
      if (!chartRef.current) return;

      // Find percentile series and only show it if there is a selected scenario
      chartRef.current?.series.values
        .filter((series) => {
          let seriesID = series.get('id');
          if (seriesID?.includes(chartId)) seriesID = seriesID.split('_')[1];
          return seriesID === 'percentiles';
        })
        .map((percentileSeries) => {
          if (selectedScenario === null || selectedScenario === 0) {
            void percentileSeries.hide();
          } else {
            void percentileSeries.show();
          }
        });
    },
    // Re-run effect when the selected scenario changes
    [chartId, selectedScenario]
  );

  // Effect to add Guide when date selected
  useEffect(() => {
    // Skip effect if chart (or root) is not initialized yet or no date is selected
    if (!chartRef.current || !rootRef.current || !selectedDate) {
      return;
    }

    // Get xAxis from chart
    const xAxis = chartRef.current.xAxes.getIndex(0) as DateAxis<AxisRendererX>;

    // Create data item for range
    const rangeDataItem = xAxis.makeDataItem({
      // Make sure the time of the start date object is set to first second of day
      value: new Date(selectedDate).setHours(0, 0, 0),
      // Make sure the time of the end date object is set to last second of day
      endValue: new Date(selectedDate).setHours(23, 59, 59),
      // Line and label should drawn above the other elements
      above: true,
    });

    // Create the range with the data item
    const range = xAxis.createAxisRange(rangeDataItem);

    // Set stroke of range (line with label)
    range.get('grid')?.setAll({
      stroke: color(theme.palette.primary.main),
      strokeOpacity: 1,
      strokeWidth: 2,
      location: 0.5,
      visible: true,
    });

    // Set fill of range (rest of the day)
    range.get('axisFill')?.setAll({
      fill: color(theme.palette.primary.main),
      fillOpacity: 0.3,
      visible: true,
    });

    // Set label for range
    range.get('label')?.setAll({
      fill: color(theme.palette.primary.contrastText),
      text: new Date(selectedDate).toLocaleDateString(localization.customLang, {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
      }),
      location: 0.5,
      background: RoundedRectangle.new(rootRef.current, {
        fill: color(theme.palette.primary.main),
      }),
      // Put Label to the topmost layer to make sure it is drawn on top of the axis tick labels
      layer: Number.MAX_VALUE,
    });

    return () => {
      // Discard range before re-running this effect
      xAxis.axisRanges.removeValue(range);
    };
  }, [selectedDate, theme, localization.customLang]);

  // Effect to add guide for the reference day
  useEffect(
    () => {
      // Skip effect if chart (or root) is not initialized yet or no date is selected
      if (!chartRef.current || !rootRef.current || !referenceDay) {
        return;
      }

      // Get xAxis from chart
      const xAxis = chartRef.current.xAxes.getIndex(0) as DateAxis<AxisRendererX>;

      const referenceDate = new Date(referenceDay);
      const start = referenceDate.setHours(12, 0, 0);

      // Create data item for range
      const rangeDataItem = xAxis.makeDataItem({
        // Make sure the time of the start date object is set to first second of day
        value: start,
        // Line and label should drawn above the other elements
        above: true,
      });

      // Create the range with the data item
      const range = xAxis.createAxisRange(rangeDataItem);

      // Set stroke of range (line with label)
      range.get('grid')?.setAll({
        stroke: color(darken(theme.palette.divider, 0.25)),
        strokeOpacity: 1,
        strokeWidth: 2,
        strokeDasharray: [6, 4],
      });

      setReferenceDayX();
      xAxis.onPrivate('selectionMin', setReferenceDayX);
      xAxis.onPrivate('selectionMax', setReferenceDayX);
      const resizeObserver = new ResizeObserver(setReferenceDayX);
      resizeObserver.observe(rootRef.current.dom);

      return () => {
        // Discard range before re-running this effect
        xAxis.axisRanges.removeValue(range);
        resizeObserver.disconnect();
      };
    },
    // Re-run effect when selection changes (date/scenario/compartment/district) or when the active scenarios/filters change (theme and translation do not change after initialization)
    [referenceDay, theme, localization.customLang, setReferenceDayX]
  );

  // Effect to update Simulation and case data
  useEffect(() => {
    // Skip effect if chart is not initialized yet
    if (!chartRef.current) return;
    // Also skip if there is no scenario or compartment selected
    if (selectedScenario === null || !selectedCompartment) return;

    // Create empty map to match dates
    const dataMap = new Map<string, {[key: string]: number}>();

    // Cycle through scenarios
    activeScenarios?.forEach((scenarioId) => {
      if (scenarioId) {
        simulationData?.[scenarioId]?.forEach(({day, value}) => {
          // Add scenario data to map (upsert date entry)
          dataMap.set(day, {...dataMap.get(day), [scenarioId]: value});
        });
      }

      if (scenarioId === 0) {
        // Add case data values (upsert date entry)
        caseData?.forEach((entry) => {
          dataMap.set(entry.day, {...dataMap.get(entry.day), [0]: entry.value});
        });
      }
    });

    if (percentileData) {
      // Add 25th percentile data
      percentileData[0].forEach((entry) => {
        dataMap.set(entry.day, {...dataMap.get(entry.day), percentileDown: entry.value});
      });

      // Add 75th percentile data
      percentileData[1].forEach((entry) => {
        dataMap.set(entry.day, {...dataMap.get(entry.day), percentileUp: entry.value});
      });
    }

    // Add groupFilter data of visible filters
    if (groupFilterList && groupFilterData) {
      Object.values(groupFilterList).forEach((groupFilter) => {
        if (groupFilter?.isVisible) {
          // Check if data for filter is available (else report error)
          if (groupFilterData[groupFilter.name]) {
            groupFilterData[groupFilter.name].forEach((entry) => {
              dataMap.set(entry.day, {
                ...dataMap.get(entry.day),
                [groupFilter.name]: entry.value,
              });
            });
          } else {
            console.error(`ERROR: missing data for "${groupFilter.name}" filter`);
          }
        }
      });
    }

    // Sort map by date
    const dataMapSorted = new Map(Array.from(dataMap).sort(([a], [b]) => String(a).localeCompare(b)));
    const data = Array.from(dataMapSorted).map(([day, data]) => {
      return {date: day, ...data};
    });

    // Put data into series
    chartRef.current.series.each((series, i) => {
      // Set-up data processors for first series (not needed for others since all use the same data)
      if (i === 0) {
        series.data.processor = DataProcessor.new(rootRef.current as Root, {
          // Define date fields and their format (incoming format from API)
          dateFields: ['date'],
          dateFormat: 'yyyy-MM-dd',
        });
      }
      // Link each series to data
      series.data.setAll(data);
    });

    // Set up HTML tooltip
    const tooltipHTML = `
        ${'' /* Current Date and selected compartment name */}
        <strong>{date.formatDate("${
          localization.overrides && localization.overrides['dateFormat']
            ? customT(localization.overrides['dateFormat'])
            : defaultT('dateFormat')
        }")} (${
          localization.overrides && localization.overrides[`compartments.${selectedCompartment}`]
            ? customT(localization.overrides[`compartments.${selectedCompartment}`])
            : defaultT(`compartments.${selectedCompartment}`)
        })</strong>
        <table>
          ${
            // Table row for each series of an active scenario
            chartRef.current.series.values
              .filter((series) => {
                if (!series.get('id')) return false;
                let s = series.get('id');
                if (series.get('id')?.includes(chartId)) s = s?.split('_')[1];
                return activeScenarios?.includes(Number(s));
              })
              .map((series): string => {
                /* Skip if series:
                 * - is hidden
                 * - is percentile series (which is added to the active scenario series)
                 * - is group filter series
                 */
                let seriesID = series.get('id');
                if (seriesID?.includes(chartId)) seriesID = seriesID?.split('_')[1];
                if (series.isHidden() || seriesID === 'percentiles' || seriesID?.startsWith('group-filter-')) {
                  return '';
                }
                /* Skip with error if series does not have property:
                 * - id
                 * - name
                 * - valueYField
                 * - stroke
                 */
                if (!seriesID || !series.get('name') || !series.get('valueYField') || !series.get('stroke')) {
                  console.error(
                    'ERROR: missing series property: ',
                    seriesID,
                    series.get('name'),
                    series.get('valueYField'),
                    series.get('stroke')
                  );
                  return '';
                }
                // Handle series normally
                return `
                <tr>
                  <th style='text-align:left; color:${(
                    series.get('stroke') as Color
                  ).toCSSHex()}; padding-right:${theme.spacing(2)}'>
                    <strong>${series.get('name') as string}</strong>
                  </th>
                  <td style='text-align:right'>
                    {${series.get('valueYField') as string}}
                  </td>
                  ${
                    // Skip percentiles if this series is not the selected scenario or case data
                    seriesID !== selectedScenario.toString() || selectedScenario === 0
                      ? ''
                      : `
                        <td>
                          [{percentileDown} - {percentileUp}]
                        </td>
                        `
                  }
                </tr>
                ${
                  // Add group filters if this series is the selected scenario
                  seriesID !== selectedScenario.toString()
                    ? ''
                    : // Add table row for each active group filter
                      (chartRef.current as XYChart).series.values
                        .filter((series) => {
                          let seriesID = series.get('id');
                          if (seriesID?.includes(chartId)) seriesID = seriesID.split('_')[1];
                          return seriesID?.startsWith('group-filter-') && !series.isHidden();
                        })
                        .map((groupFilterSeries) => {
                          return `
                            <tr>
                              <th style='text-align:left; color:${(
                                groupFilterSeries.get('stroke') as Color
                              ).toCSSHex()}; padding-right:${theme.spacing(2)}; padding-left:${theme.spacing(2)}'>
                                <strong>${groupFilterSeries.get('name') as string}</strong>
                              </th>
                              <td style='text-align:right'>
                                {${groupFilterSeries.get('valueYField') as string}}
                              </td>
                            </tr>
                            `;
                        })
                        .join('')
                }
                `;
              })
              .join('')
          }
        </table>
      `;

    // Attach tooltip to series
    chartRef.current.series.each((series) => {
      const tooltip = Tooltip.new(rootRef.current as Root, {
        labelHTML: tooltipHTML,
        getFillFromSprite: false,
        autoTextColor: false,
        pointerOrientation: 'horizontal',
      });

      // Set tooltip default text color to theme primary text color
      tooltip.label.setAll({
        fill: color(theme.palette.text.primary),
      });

      // Set tooltip background to theme paper
      tooltip.get('background')?.setAll({
        fill: color(theme.palette.background.paper),
      });

      // Set tooltip
      series.set('tooltip', tooltip);
    });

    // Collect data field names & order for data export
    // Always export date and case data (and percentiles of selected scenario)
    let dataFields = {
      date: `${
        localization.overrides && localization.overrides['chart.date']
          ? customT(localization.overrides['chart.date'])
          : defaultT('chart.date')
      }`,
      caseData: `${
        localization.overrides && localization.overrides['chart.caseData']
          ? customT(localization.overrides['chart.caseData'])
          : defaultT('chart.caseData')
      }`,
      percentileUp: `${
        localization.overrides && localization.overrides['chart.percentileUp']
          ? customT(localization.overrides['chart.percentileUp'])
          : defaultT('chart.percentileUp')
      }`,
      percentileDown: `${
        localization.overrides && localization.overrides['chart.percentileDown']
          ? customT(localization.overrides['chart.percentileDown'])
          : defaultT('chart.percentileDown')
      }`,
    };
    // Always put date first, case data second
    const dataFieldsOrder = ['date', 'caseData'];
    // Loop through active scenarios (if there are any)
    if (activeScenarios) {
      activeScenarios.forEach((scenarioId) => {
        // Skip case data (already added)
        if (scenarioId === 0 || !scenarioId || !scenarioList.scenarios[scenarioId]) {
          return;
        }

        // Add scenario label to export data field names
        dataFields = {
          ...dataFields,
          [scenarioId]: scenarioList.scenarios[scenarioId].label,
        };
        // Add scenario id to export data field order (for sorted export like csv)
        dataFieldsOrder.push(`${scenarioId}`);
        // If this is the selected scenario also add percentiles after it
        if (scenarioId == selectedScenario) {
          dataFieldsOrder.push('percentileDown', 'percentileUp');
        }
      });
    }

    // Let's import this lazily, since it contains a lot of code.
    import('@amcharts/amcharts5/plugins/exporting')
      .then((module) => {
        // Update export menu
        module.Exporting.new(rootRef.current as Root, {
          menu: module.ExportingMenu.new(rootRef.current as Root, {}),
          filePrefix: exportedFileName,
          dataSource: data,
          dateFields: ['date'],
          dateFormat: `${
            localization.overrides && localization.overrides['dateFormat']
              ? customT(localization.overrides['dateFormat'])
              : defaultT('dateFormat')
          }`,
          dataFields: dataFields,
          dataFieldsOrder: dataFieldsOrder,
        });
      })
      .catch(() => console.warn("Couldn't load exporting functionality!"));

    setReferenceDayX();
    // Re-run this effect whenever the data itself changes (or any variable the effect uses)
  }, [
    percentileData,
    simulationData,
    caseData,
    groupFilterData,
    activeScenarios,
    selectedScenario,
    scenarioList,
    selectedCompartment,
    theme,
    groupFilterList,
    defaultT,
    customT,
    setReferenceDayX,
    chartId,
    localization.overrides,
    exportedFileName,
  ]);

  return (
    <>
      <Box
        id={chartId}
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
    </>
  );
}
