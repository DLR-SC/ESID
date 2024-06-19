// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {useCallback, useEffect, useLayoutEffect, useMemo} from 'react';
import {Root} from '@amcharts/amcharts5/.internal/core/Root';
import {Tooltip} from '@amcharts/amcharts5/.internal/core/render/Tooltip';
import {RoundedRectangle} from '@amcharts/amcharts5/.internal/core/render/RoundedRectangle';
import {Color, color} from '@amcharts/amcharts5/.internal/core/util/Color';
import {DataProcessor} from '@amcharts/amcharts5/.internal/core/util/DataProcessor';
import {IXYChartSettings, XYChart} from '@amcharts/amcharts5/.internal/charts/xy/XYChart';
import {IDateAxisSettings} from '@amcharts/amcharts5/.internal/charts/xy/axes/DateAxis';
import {AxisRendererX} from '@amcharts/amcharts5/.internal/charts/xy/axes/AxisRendererX';
import {AxisRendererY} from '@amcharts/amcharts5/.internal/charts/xy/axes/AxisRendererY';
import {XYCursor} from '@amcharts/amcharts5/.internal/charts/xy/XYCursor';
import {LineSeries} from '@amcharts/amcharts5/.internal/charts/xy/series/LineSeries';
import am5locales_en_US from '@amcharts/amcharts5/locales/en_US';
import am5locales_de_DE from '@amcharts/amcharts5/locales/de_DE';
import {darken, useTheme} from '@mui/material/styles';
import Box from '@mui/material/Box';
import {useTranslation} from 'react-i18next';
import {Dictionary} from '../../util/util';
import React from 'react';
import {Scenario} from 'store/ScenarioSlice';
import {Localization} from 'types/localization';
import {getScenarioPrimaryColor} from 'util/Theme';
import useRoot from 'components/shared/Root';
import {useConst} from 'util/hooks';
import useXYChart from 'components/shared/LineChart/Chart';
import useDateAxis from 'components/shared/LineChart/DateAxis';
import useValueAxis from 'components/shared/LineChart/ValueAxis';
import {useDateSelectorFilter} from 'components/shared/LineChart/Filter';
import useDateAxisRange from 'components/shared/LineChart/AxisRange';
import useLineSeries, {useLineSeriesList} from 'components/shared/LineChart/LineSeries';

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
  /** Optional unique identifier for the chart. Defaults to 'chartdiv'. */
  chartId?: string;

  /** The currently selected date in the chart in ISO format (YYYY-MM-DD). */
  selectedDate: string;

  /** Callback function to update the selected date in the chart. */
  setSelectedDate: (date: string) => void;

  /**
   * Optional callback function to get the x-coordinate position of the reference date in the chart.
   * This can be used for positioning elements in relation to the reference date.
   */
  setReferenceDayBottom?: (docPos: number) => void;

  /**
   * Optional array of arrays containing simulation data points.
   * Each sub-array corresponds to a different simulation scenario and contains objects with `day` and `value` properties.
   * The first element in the array should be null.
   */
  simulationData?: ({day: string; value: number}[] | null)[] | null;

  /**
   * Optional function to determine the chart name for a given simulation scenario.
   * This function is passed a `Scenario` object and returns a string name.
   */
  simulationDataChartName?: (scenario: Scenario) => string;

  /**
   * Array of data points representing case data, where each data point includes a `day` and its corresponding `value`.
   * This data is used to plot the actual case data on the chart.
   */
  caseData: {day: string; value: number}[] | undefined;

  /**
   * Optional array of arrays containing percentile data points, where each data point includes a `day` and its corresponding `value`.
   * This data is used to plot percentile ranges on the chart.
   */
  percentileData?: {day: string; value: number}[][] | null;

  /**
   * Optional dictionary of filtered group data points, where each entry includes a `day` and its corresponding `value`.
   * This data is used to plot different filtered group data on the chart.
   */
  groupFilterData?: Dictionary<{day: string; value: number}[]> | null;

  /** Optional minimum date for the chart in ISO format (YYYY-MM-DD). */
  minDate?: string | null;

  /** Optional maximum date for the chart in ISO format (YYYY-MM-DD). */
  maxDate?: string | null;

  /** Optional currently selected scenario identifier. */
  selectedScenario?: number | null;

  /** Optional array of active scenario identifiers. These scenarios will be displayed on the chart. */
  activeScenarios?: number[] | null;

  /** Optional reference day for the chart in ISO format (YYYY-MM-DD). */
  referenceDay?: string | null;

  /** The currently selected compartment in the chart, which represents different categories or groups in the data. */
  selectedCompartment: string;

  /**
   * Optional list of scenarios available for selection.
   * This list includes the details of all possible scenarios that can be plotted on the chart.
   */
  scenarioList?: ScenarioList | null;

  /**
   * Optional dictionary of group filter configurations.
   * This includes settings for how different groups should be filtered and displayed on the chart.
   */
  groupFilterList?: Dictionary<GroupFilter> | null;

  /** Optional name for the exported file when the chart data is downloaded. Defaults to 'Data'. */
  exportedFileName?: string;

  /** Optional localization settings for the chart, including number formatting and language overrides. */
  localization?: Localization;
}

/**
 * React Component to render the Linechart Section
 * @returns {JSX.Element} JSX Element to render the linechart container and the graphs within.
 */
export default function LineChart({
  chartId = 'chartdiv',
  selectedDate,
  setSelectedDate,
  setReferenceDayBottom = () => {},
  simulationData = null,
  caseData,
  simulationDataChartName = () => '',
  percentileData = null,
  groupFilterData = null,
  minDate = null,
  maxDate = null,
  selectedScenario = null,
  activeScenarios = null,
  referenceDay = null,
  selectedCompartment,
  scenarioList = null,
  groupFilterList = null,
  exportedFileName = 'Data',
  localization = {
    formatNumber: (value) => value.toLocaleString(),
    customLang: 'global',
    overrides: {},
  },
}: LineChartProps): JSX.Element {
  const {t: defaultT, i18n} = useTranslation();
  const {t: customT} = useTranslation(localization.customLang);
  const theme = useTheme();

  const root = useRoot(
    chartId,
    undefined,
    useConst((root) => {
      root.numberFormatter.set('numberFormat', '#,###.');
    })
  );

  const chartSettings = useConst<IXYChartSettings>({
    panX: false,
    panY: false,
    wheelX: 'panX',
    wheelY: 'zoomX',
    maxTooltipDistance: -1,
  });

  const chart = useXYChart(
    root,
    chartSettings,
    useCallback(
      (chart: XYChart) => {
        if (root) {
          chart.leftAxesContainer.set('layout', root.verticalLayout);
        }
      },
      [root]
    )
  );

  const xAxisSettings = useMemo(() => {
    if (!root || !chart) {
      return null;
    }

    return {
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
    } as IDateAxisSettings<AxisRendererX>;
  }, [root, chart]);

  const xAxis = useDateAxis(
    root,
    chart,
    xAxisSettings,
    useConst((axis) => {
      axis.get('renderer').ticks.template.setAll({location: 0.5});
    })
  );

  const yAxisSettings = useMemo(() => {
    if (!root || !chart) {
      return null;
    }

    return {
      renderer: AxisRendererY.new(root, {}),
      // Fix lower end to 0
      min: 0,
      // Add tooltip instance so cursor can display value
      tooltip: Tooltip.new(root, {}),
    };
  }, [root, chart]);

  const yAxis = useValueAxis(root, chart, yAxisSettings);

  // Effect to add cursor to chart
  useLayoutEffect(() => {
    if (!chart || !root || !xAxis) {
      return;
    }

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
  }, [chart, root, xAxis]);

  // Effect to add date selector filter to chart
  useDateSelectorFilter(chart, xAxis, setSelectedDate);

  // Effect to change localization of chart if language changes
  useLayoutEffect(
    () => {
      // Skip if root or chart or xAxis is not initialized
      if (!root || !chart || !xAxis) {
        return;
      }

      // Set localization
      root.locale = i18n.language === 'de' ? am5locales_de_DE : am5locales_en_US;

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
    [i18n.language, root, chart, xAxis, defaultT, customT, localization.overrides]
  );

  // Effect to update min/max date.
  useLayoutEffect(() => {
    // Skip if root or chart or xAxis is not initialized
    if (!xAxis || !minDate || !maxDate) {
      return;
    }

    xAxis.set('min', new Date(minDate).setHours(0));
    xAxis.set('max', new Date(maxDate).setHours(23, 59, 59));
  }, [minDate, maxDate, xAxis]);

  const selectedDateRangeSettings = useMemo(() => {
    if (!root || !selectedDate) {
      return {};
    }

    return {
      data: {
        value: new Date(selectedDate).setHours(0, 0, 0),
        endValue: new Date(selectedDate).setHours(23, 59, 59),
        above: true,
      },
      grid: {
        stroke: color(theme.palette.primary.main),
        strokeOpacity: 1,
        strokeWidth: 2,
        location: 0.5,
        visible: true,
      },
      axisFill: {
        fill: color(theme.palette.primary.main),
        fillOpacity: 0.3,
        visible: true,
      },
      label: {
        fill: color(theme.palette.primary.contrastText),
        text: new Date(selectedDate).toLocaleDateString(i18n.language, {
          year: 'numeric',
          month: 'short',
          day: '2-digit',
        }),
        location: 0.5,
        background: RoundedRectangle.new(root, {
          fill: color(theme.palette.primary.main),
        }),
        // Put Label to the topmost layer to make sure it is drawn on top of the axis tick labels
        layer: Number.MAX_VALUE,
      },
    };
  }, [i18n.language, root, selectedDate, theme.palette.primary.contrastText, theme.palette.primary.main]);
  useDateAxisRange(selectedDateRangeSettings, root, chart, xAxis);

  const referenceDateRangeSettings = useMemo(() => {
    if (!referenceDay) {
      return {};
    }

    return {
      data: {
        value: new Date(referenceDay).setHours(12, 0, 0),
        above: true,
      },
      grid: {
        stroke: color(darken(theme.palette.divider, 0.25)),
        strokeOpacity: 1,
        strokeWidth: 2,
        strokeDasharray: [6, 4],
      },
    };
  }, [referenceDay, theme.palette.divider]);
  useDateAxisRange(referenceDateRangeSettings, root, chart, xAxis);

  const setReferenceDayX = useCallback(() => {
    if (!chart || !root || !xAxis || !referenceDay) {
      return;
    }

    const midday = new Date(referenceDay).setHours(12, 0, 0);

    const xAxisPosition = xAxis.width() * xAxis.toGlobalPosition(xAxis.dateToPosition(new Date(midday)));
    const globalPosition = xAxis.toGlobal({x: xAxisPosition, y: 0});
    const docPosition = root.rootPointToDocument(globalPosition).x;
    setReferenceDayBottom(docPosition);
  }, [chart, root, xAxis, referenceDay, setReferenceDayBottom]);

  useLayoutEffect(() => {
    if (!root || !chart || !xAxis) {
      return;
    }

    setReferenceDayX();
    const minEvent = xAxis.onPrivate('selectionMin', setReferenceDayX);
    const maxEvent = xAxis.onPrivate('selectionMax', setReferenceDayX);
    const seriesEvent = chart.series.events.on('push', (ev) => {
      ev.newValue.events.on('boundschanged', setReferenceDayX);
    });

    const resizeObserver = new ResizeObserver(setReferenceDayX);
    resizeObserver.observe(root.dom);

    return () => {
      resizeObserver.disconnect();
      minEvent.dispose();
      maxEvent.dispose();
      seriesEvent.dispose();
    };
  }, [root, chart, xAxis, setReferenceDayX]);

  const caseDataSeriesSettings = useMemo(() => {
    if (!xAxis || !yAxis) {
      return null;
    }

    return {
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
    };
  }, [localization.overrides, xAxis, yAxis, chartId, defaultT, customT]);
  useLineSeries(
    root,
    chart,
    caseDataSeriesSettings,
    useConst((series) => {
      series.strokes.template.setAll({
        strokeWidth: 2,
      });
    })
  );

  const percentileSeriesSettings = useMemo(() => {
    if (!xAxis || !yAxis || !selectedScenario) {
      return null;
    }

    return {
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
          ? color(getScenarioPrimaryColor(selectedScenario, theme))
          : undefined,
    };
  }, [selectedScenario, xAxis, yAxis, chartId, theme]);
  useLineSeries(
    root,
    chart,
    percentileSeriesSettings,
    useConst((series) => {
      series.strokes.template.setAll({
        strokeWidth: 0,
      });
      series.fills.template.setAll({
        fillOpacity: 0.3,
        visible: true,
      });
    })
  );

  const scenarioSeriesSettings = useMemo(() => {
    if (!root || !xAxis || !yAxis || !scenarioList) {
      return [];
    }

    return Object.entries(scenarioList.scenarios).map(([scenarioId, scenario]) => ({
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
        labelText: `[bold ${getScenarioPrimaryColor(scenario.id, theme)}]${simulationDataChartName(scenario)}:[/] {${scenarioId}}`,
      }),
      stroke: color(getScenarioPrimaryColor(scenario.id, theme)),
    }));
  }, [scenarioList, root, simulationDataChartName, xAxis, yAxis, chartId, theme]);
  useLineSeriesList(
    root,
    chart,
    scenarioSeriesSettings,
    useConst((series) => {
      series.strokes.template.setAll({
        strokeWidth: 2,
      });
    })
  );

  const groupFilterStrokes = useMemo(() => {
    return [
      [2, 4], // dotted
      [8, 4], // dashed
      [8, 4, 2, 4], // dash-dotted
      [8, 4, 2, 4, 2, 4], // dash-dot-dotted
    ];
  }, []);

  const groupFilterSeriesSettings = useMemo(() => {
    if (!root || !xAxis || !yAxis || !groupFilterList || !selectedScenario) {
      return [];
    }

    // Loop through visible group filters
    return Object.values(groupFilterList)
      .filter((groupFilter) => groupFilter.isVisible)
      .map((groupFilter) => ({
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
          labelText: `[bold ${getScenarioPrimaryColor(selectedScenario, theme)}]${
            groupFilter.name
          }:[/] {${groupFilter.name}}`,
        }),
        stroke: color(getScenarioPrimaryColor(selectedScenario, theme)),
      }));
  }, [groupFilterList, root, selectedScenario, xAxis, yAxis, chartId, theme]);
  useLineSeriesList(
    root,
    chart,
    groupFilterSeriesSettings,
    useConst((series, i) => {
      series.strokes.template.setAll({
        strokeWidth: 2,
        // Loop through stroke list if group filters exceeds list length
        strokeDasharray: groupFilterStrokes[i % groupFilterStrokes.length],
      });
    })
  );

  // Effect to hide disabled scenarios (and show them again if not hidden anymore)
  useLayoutEffect(
    () => {
      const allSeries = chart?.series;
      // Skip effect if chart is not initialized (contains no series yet)
      if (!allSeries) return;

      // Set visibility of each series
      allSeries.each((series) => {
        if (!(series instanceof LineSeries)) {
          return;
        }

        // Everything but scenario series evaluate to NaN (because scenario series have their scenario id as series id while others have names)
        let seriesID = series.get('id');
        if (seriesID) seriesID = seriesID.split('_')[1];
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
    [activeScenarios, chartId, chart]
  );

  // Effect to hide deviations if no scenario is selected
  useEffect(
    () => {
      // Skip effect if chart is not initialized (contains no series yet)
      if (!chart) return;

      // Find percentile series and only show it if there is a selected scenario
      chart?.series.values
        .filter((series) => {
          let seriesID = series.get('id');
          if (seriesID) seriesID = seriesID.split('_')[1];
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
    [chartId, selectedScenario, chart]
  );

  // Effect to update Simulation and case data
  useEffect(() => {
    // Skip effect if chart is not initialized yet
    if (!chart) return;
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
    chart.series.each((series, i) => {
      // Set-up data processors for first series (not needed for others since all use the same data)
      if (i === 0) {
        series.data.processor = DataProcessor.new(root as Root, {
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
          localization.overrides && localization.overrides[`compartment.${selectedCompartment}`]
            ? customT(localization.overrides[`compartment.${selectedCompartment}`])
            : defaultT(`compartment.${selectedCompartment}`)
        })</strong>
        <table>
          ${
            // Table row for each series of an active scenario
            chart.series.values
              .filter((series) => {
                if (!series.get('id')) return false;
                let s = series.get('id');
                if (s) s = s?.split('_')[1];
                return activeScenarios?.includes(Number(s));
              })
              .map((series): string => {
                /* Skip if series:
                 * - is hidden
                 * - is percentile series (which is added to the active scenario series)
                 * - is group filter series
                 */
                let seriesID = series.get('id');
                if (seriesID) seriesID = seriesID?.split('_')[1];
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
                      chart.series.values
                        .filter((series) => {
                          let seriesID = series.get('id');
                          if (seriesID) seriesID = seriesID.split('_')[1];
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
    chart.series.each((series) => {
      const tooltip = Tooltip.new(root as Root, {
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
        if (scenarioId === 0 || !scenarioId || !scenarioList || !scenarioList.scenarios[scenarioId]) {
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
        module.Exporting.new(root as Root, {
          menu: module.ExportingMenu.new(root as Root, {}),
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
    chart,
    root,
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
