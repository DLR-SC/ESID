// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {useCallback, useEffect, useLayoutEffect, useMemo} from 'react';
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
import am5locales_en_US from '@amcharts/amcharts5/locales/en_US';
import am5locales_de_DE from '@amcharts/amcharts5/locales/de_DE';
import {darken, useTheme} from '@mui/material/styles';
import Box from '@mui/material/Box';
import {useTranslation} from 'react-i18next';
import {Localization} from 'types/localization';
import useRoot from 'components/shared/Root';
import {useConst} from 'util/hooks';
import useXYChart from 'components/shared/LineChart/Chart';
import useDateAxis from 'components/shared/LineChart/DateAxis';
import useValueAxis from 'components/shared/LineChart/ValueAxis';
import {useDateSelectorFilter} from 'components/shared/LineChart/Filter';
import useDateAxisRange from 'components/shared/LineChart/AxisRange';
import {useLineSeriesList} from 'components/shared/LineChart/LineSeries';
import {LineSeries} from '@amcharts/amcharts5/.internal/charts/xy/series/LineSeries';
import {LineChartData} from 'types/lineChart';

interface LineChartProps {
  /** Optional unique identifier for the chart. Defaults to 'chartdiv'. */
  chartId?: string;

  /** Array of line chart data points to be plotted on the chart. */
  lineChartData: LineChartData[] | undefined;

  /** The currently selected date in the chart in ISO format (YYYY-MM-DD). */
  selectedDate: string;

  /** Callback function to update the selected date in the chart. */
  setSelectedDate: (date: string) => void;

  /**
   * Optional callback function to get the x-coordinate position of the reference date in the chart.
   * This can be used for positioning elements in relation to the reference date.
   */
  setReferenceDayBottom?: (docPos: number) => void;

  /** Optional minimum date for the chart in ISO format (YYYY-MM-DD). */
  minDate?: string | null;

  /** Optional maximum date for the chart in ISO format (YYYY-MM-DD). */
  maxDate?: string | null;

  /** Optional reference day for the chart in ISO format (YYYY-MM-DD). */
  referenceDay?: string | null;

  /** Optional label for the LineChart. Used when label needs to be changed. To use a static label overrides yAxisLabel */
  yAxisLabel?: string;

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
  lineChartData,
  selectedDate,
  setSelectedDate,
  setReferenceDayBottom = () => {},
  minDate = null,
  maxDate = null,
  referenceDay = null,
  exportedFileName = 'Data',
  yAxisLabel,
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
    if (!chart || !root || !xAxis || chart.isDisposed() || root.isDisposed() || xAxis.isDisposed()) {
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
    // This effect should re-run when chart, root and xAxis are initialized
  }, [chart, root, xAxis]);

  // Effect to add date selector filter to chart
  useDateSelectorFilter(chart, xAxis, setSelectedDate);

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

  // Effect to change localization of chart if language changes
  useLayoutEffect(
    () => {
      // Skip if root or chart or xAxis is not initialized
      if (!root || !chart || !xAxis || chart.isDisposed() || root.isDisposed() || xAxis.isDisposed()) {
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
    if (!xAxis || !minDate || !maxDate || xAxis.isDisposed()) {
      return;
    }

    xAxis.set('min', new Date(minDate).setHours(0));
    xAxis.set('max', new Date(maxDate).setHours(23, 59, 59));
    // This effect should re-run when xAxis, minDate or maxDate changes
  }, [minDate, maxDate, xAxis]);

  const referenceDateRangeSettings = useMemo(() => {
    if (!root || !referenceDay) {
      return {};
    }

    return {
      data: {
        value: new Date(referenceDay).setHours(12, 0, 0),
        endValue: new Date(referenceDay).setHours(12, 0, 1),
        above: true,
      },
      grid: {
        stroke: color(darken(theme.palette.divider, 0.25)),
        strokeOpacity: 1,
        strokeWidth: 2,
        strokeDasharray: [6, 4],
      },
    };
  }, [root, referenceDay, theme.palette.divider]);

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

  // Effect to update reference day position
  useLayoutEffect(() => {
    if (!root || !chart || !xAxis || chart.isDisposed() || root.isDisposed() || xAxis.isDisposed()) {
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
    // This effect should re-run when root, chart and xAxis are initialized
  }, [root, chart, xAxis, setReferenceDayX]);

  const lineChartDataSettings = useMemo(() => {
    if (!root || !xAxis || !yAxis || !lineChartData) {
      return [];
    }

    return lineChartData.map((line) => {
      let lineName = line.name;
      if (lineName) {
        if (localization.overrides && localization.overrides[lineName]) {
          lineName = customT(localization.overrides[lineName]);
        } else {
          lineName = defaultT(lineName);
        }
      }
      return {
        xAxis: xAxis,
        yAxis: yAxis,
        id: `${chartId}_${line.serieId}`,
        name: lineName ?? '',
        valueXField: 'date',
        valueYField: String(line.valueYField),
        openValueYField: line.openValueYField ? String(line.openValueYField) : undefined,
        connect: false,
        visible: line.visible ?? true,
        tooltip: Tooltip.new(root, {
          labelText: line.tooltipText,
        }),
        stroke: line.stroke.color,
        fill: line.fill ?? undefined,
      };
    });
  }, [lineChartData, root, xAxis, yAxis, chartId, localization, defaultT, customT]);

  useLineSeriesList(
    root,
    chart,
    lineChartDataSettings,
    useCallback(
      (series: LineSeries) => {
        if (!lineChartData) return;
        const seriesSettings = lineChartData.find((line) => line.serieId === series.get('id')?.split('_')[1]);
        series.strokes.template.setAll({
          strokeWidth: seriesSettings?.stroke.strokeWidth ?? 2,
          strokeDasharray: seriesSettings?.stroke.strokeDasharray ?? undefined,
        });
        if (seriesSettings?.fill) {
          series.fills.template.setAll({
            fillOpacity: seriesSettings.fillOpacity ?? 1,
            visible: true,
          });
        }
      },
      [lineChartData]
    )
  );

  // Effect to update data in series
  useEffect(() => {
    // Skip effect if chart is not initialized yet
    if (!chart || chart.isDisposed()) return;
    // Also skip if there is no data
    if (!lineChartData || lineChartData.length == 0) return;

    // Create empty map to match dates
    const dataMap = new Map<string, {[key: string]: number}>();

    lineChartData.forEach((serie) => {
      const id = serie.serieId;
      if (typeof id === 'string' && id.startsWith('group-filter-')) {
        serie.values.forEach((entry) => {
          dataMap.set(entry.day, {...dataMap.get(entry.day), [serie.name!]: entry.value as number});
        });
      } else if (serie.openValueYField) {
        serie.values.forEach((entry) => {
          dataMap.set(entry.day, {...dataMap.get(entry.day), [serie.valueYField]: (entry.value as number[])[1]});
          dataMap.set(entry.day, {
            ...dataMap.get(entry.day),
            [String(serie.openValueYField)]: (entry.value as number[])[0],
          });
        });
      } else {
        serie.values.forEach((entry) => {
          dataMap.set(entry.day, {...dataMap.get(entry.day), [serie.valueYField]: entry.value as number});
        });
      }
    });

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
          yAxisLabel ??
          (localization.overrides && localization.overrides[`yAxisLabel`]
            ? customT(localization.overrides[`yAxisLabel`])
            : defaultT(`yAxisLabel`))
        })</strong>
        <table>
          ${
            // Table row for each series of an active scenario
            chart.series.values
              .map((series): string => {
                /* Skip if series:
                 * - is hidden
                 * - is percentile series (which is added to the active scenario series)
                 * - is group filter series
                 */
                let seriesID = series.get('id');
                if (seriesID) seriesID = seriesID?.split('_')[1];
                if (seriesID === 'percentiles' || seriesID?.startsWith('group-filter-')) {
                  return '';
                }
                /* Skip with error if series does not have property:
                 * - id
                 * - name
                 * - valueYField
                 * - stroke
                 */
                if (
                  seriesID == null ||
                  !series.get('name') ||
                  series.get('valueYField') == null ||
                  !series.get('stroke')
                ) {
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
                    lineChartData.find((serie) => serie.parentId == seriesID)
                      ? `
                        <td>
                          [{percentileDown} - {percentileUp}]
                        </td>
                        `
                      : ''
                  }
                </tr>
                ${
                  // Add group filters if this series is the selected scenario
                  lineChartData.find((serie) => serie.parentId == seriesID)
                    ? // Add table row for each active group filter
                      chart.series.values
                        .filter((series) => {
                          let seriesID = series.get('id');
                          if (seriesID) seriesID = seriesID.split('_')[1];
                          return seriesID?.startsWith('group-filter-');
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
                    : ''
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
    // Always put date first, 0 second
    const dataFieldsOrder = ['date', '0'];

    if (lineChartData) {
      lineChartData.forEach((serie) => {
        if (serie.serieId === 'percentiles' || serie.serieId.toString().startsWith('group-filter-')) return;

        let lineName = serie.name;
        if (lineName) {
          if (localization.overrides && localization.overrides[lineName]) {
            lineName = customT(localization.overrides[lineName]);
          } else {
            lineName = defaultT(lineName);
          }
        }
        // Add scenario label to export data field names
        dataFields = {
          ...dataFields,
          [String(serie.serieId)]: lineName,
        };
        // Add scenario id to export data field order (for sorted export like csv)
        dataFieldsOrder.push(`${serie.serieId}`);
        // If this is the selected scenario also add percentiles after it
        if (lineChartData.find((line) => line.openValueYField && line.parentId == serie.serieId)) {
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
    theme,
    defaultT,
    customT,
    setReferenceDayX,
    chartId,
    localization.overrides,
    exportedFileName,
    chart,
    root,
    lineChartData,
    yAxisLabel,
  ]);

  return (
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
  );
}
