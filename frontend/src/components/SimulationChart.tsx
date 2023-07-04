import React, {useEffect, useRef} from 'react';
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
import {Exporting, ExportingMenu} from '@amcharts/amcharts5/plugins/exporting';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {useTheme} from '@mui/material/styles';
import Box from '@mui/material/Box';
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
import {useGetMultipleGroupFilterDataQuery} from 'store/services/groupApi';
import {GroupData} from 'types/group';
/*
 * This component displays the evolution of the pandemic over time for a specific infection state (hospitalized, dead, infected, etc.) regarding the different scenarios.
 */

/**
 * React Component to render the Simulation Chart Section
 * @returns {JSX.Element} JSX Element to render the scenario chart container and the scenario graph within.
 */
export default function SimulationChart(): JSX.Element {
  const {t, i18n} = useTranslation();
  const {t: tBackend} = useTranslation('backend');
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
  const numberFormat = '#,###.';

  const rootRef = useRef<Root | null>(null);
  const chartRef = useRef<XYChart | null>(null);

  // Effect to create chart instance
  useEffect(
    () => {
      // Create root and chart
      const root = Root.new('chartdiv');
      const chart = root.container.children.push(
        XYChart.new(root, {
          panX: false,
          panY: false,
          wheelX: 'panX',
          wheelY: 'zoomX',
          maxTooltipDistance: -1,
        })
      );

      // Set localization
      root.locale = i18n.language === 'de' ? am5locales_de_DE : am5locales_en_US;

      // Set number formatter
      root.numberFormatter.set('numberFormat', numberFormat);

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
      const Xrenderer = xAxis.get('renderer');
      Xrenderer.ticks.template.setAll({
        location: 0.5,
      });
      // Change date formats for ticks & tooltip (use fallback object to suppress undefined object warnings as this cannot be undefined)
      xAxis.get('dateFormats', {day: ''})['day'] = t('dayFormat');
      xAxis.get('tooltipDateFormats', {day: ''})['day'] = t('dayFormat');
      // Fix first date of the month falling back to wrong format (also with fallback object)
      xAxis.get('periodChangeDateFormats', {day: ''})['day'] = t('dayFormat');

      // Create y-axis
      const yAxis = chart.yAxes.push(
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

      // Add series for case data
      const caseDataSeries = chart.series.push(
        LineSeries.new(root, {
          xAxis: xAxis,
          yAxis: yAxis,
          id: 'caseData',
          name: t('chart.caseData'),
          valueXField: 'date',
          valueYField: 'caseData',
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
          id: 'percentiles',
          valueXField: 'date',
          valueYField: 'percentileUp',
          openValueYField: 'percentileDown',
          connect: false,
          // Add fill color according to selected scenario (if selected scenario is set)
          fill: selectedScenario
            ? color(theme.custom.scenarios[(selectedScenario - 1) % theme.custom.scenarios.length][0])
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
      Object.entries(scenarioList.scenarios).forEach(([scenarioId, scenario], i) => {
        const series = chart.series.push(
          LineSeries.new(root, {
            xAxis: xAxis,
            yAxis: yAxis,
            id: scenarioId,
            name: tBackend(`scenario-names.${scenario.label}`),
            valueXField: 'date',
            valueYField: scenarioId,
            // Prevent data points from connecting across gaps in the data
            connect: false,
            // Fallback Tooltip (if HTML breaks for some reason)
            // For text color: loop around the theme's scenario color list if scenario IDs exceed color list length, then pick first color of sub-palette which is the main color
            tooltip: Tooltip.new(root, {
              labelText: `[bold ${theme.custom.scenarios[i % theme.custom.scenarios.length][0]}]${tBackend(
                `scenario-names.${scenario.label}`
              )}:[/] {${scenarioId}}`,
            }),
            stroke: color(theme.custom.scenarios[i % theme.custom.scenarios.length][0]),
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
                id: `group-filter-${groupFilter.name}`,
                name: groupFilter.name,
                valueXField: 'date',
                valueYField: groupFilter.name,
                connect: false,
                // Fallback Tooltip (if HTML breaks for some reason)
                // Use color of selected scenario (scenario ID is 1-based index, color list is 0-based index) loop if scenario ID exceeds length of color list; use first color of palette (main color)
                tooltip: Tooltip.new(root, {
                  labelText: `[bold ${
                    theme.custom.scenarios[(selectedScenario - 1) % theme.custom.scenarios.length][0]
                  }]${groupFilter.name}:[/] {${groupFilter.name}}`,
                }),
                stroke: color(theme.custom.scenarios[(selectedScenario - 1) % theme.custom.scenarios.length][0]),
              })
            );
            series.strokes.template.setAll({
              strokeWidth: 2,
              // Loop through stroke list if group filters exceeds list length
              strokeDasharray: groupFilterStrokes[i % groupFilterStrokes.length],
            });
          });
      }

      // Add event on double click to select date
      chart.events.on('dblclick', (ev) => {
        // Get date from axis position from cursor position
        const date = xAxis.positionToDate(
          xAxis.toAxisPosition(ev.target.get('cursor')?.getPrivate('positionX') as number)
        );
        // Remove time information to only have a date
        date.setHours(0, 0, 0, 0);
        // Set date in store
        dispatch(selectDate(dateToISOString(date)));
      });

      // Set refs to be used in other effects
      rootRef.current = root;
      chartRef.current = chart;

      // Clean-up before re-running this effect
      return () => {
        // Dispose old root and chart before creating a new instance
        chartRef.current && chartRef.current.dispose();
        rootRef.current && rootRef.current.dispose();
      };
    },
    // Re-run effect when shown information changes (scenarios, group filters, or the selected scenario -> percentiles); dispatch, theme, or language (i18n & t) do not change after initialization
    [scenarioList, groupFilterList, dispatch, i18n.language, t, theme, selectedScenario, tBackend]
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
        const seriesID = Number(series.get('id'));
        // Hide series if it is a scenario series (and in the scenario list) but not in the active scenarios list
        if (!Number.isNaN(seriesID) && scenarioList.scenarios[seriesID] && !activeScenarios?.includes(seriesID)) {
          void series.hide();
        } else {
          void series.show();
        }
      });
    },
    // Re-run effect when the active scenario list or the scenarios change
    [scenarioList.scenarios, activeScenarios]
  );

  // Effect to hide deviations if no scenario is selected
  useEffect(
    () => {
      // Skip effect if chart is not initialized (contains no series yet)
      if (!chartRef.current) return;

      // Find percentile series and only show it if there is a selected scenario
      chartRef.current?.series.values
        .filter((series) => series.get('id') === 'percentiles')
        .map((percentileSeries) => {
          selectedScenario ? void percentileSeries.show() : void percentileSeries.hide();
        });
    },
    // Re-run effect when the selected scenario changes
    [selectedScenario]
  );

  // Effect to add Guide when date selected
  useEffect(
    () => {
      // Skip effect if chart is not initialized yet or no date is selected
      if (!chartRef.current || !selectedDate) return;

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
        text: new Date(selectedDate).toLocaleDateString(i18n.language, {
          year: 'numeric',
          month: 'short',
          day: '2-digit',
        }),
        location: 0.5,
        background: RoundedRectangle.new(rootRef.current as Root, {
          fill: color(theme.palette.primary.main),
        }),
        // Put Label to the topmost layer to make sure it is drawn on top of the axis tick labels
        layer: Number.MAX_VALUE,
      });

      return () => {
        // Discard range before re-running this effect
        xAxis.axisRanges.removeValue(range);
      };
    },
    // Re-run effect when selection changes (date/scenario/compartment/district) (theme and translation do not change after initialization)
    [selectedDate, selectedScenario, selectedCompartment, selectedDistrict, theme, t, i18n.language]
  );

  // Effect to update Simulation and case data
  useEffect(() => {
    // Skip effect if chart is not initialized yet
    if (!chartRef.current) return;
    // Also skip if simulation data is not populated or no data was requested (no active scenarios)
    if (!simulationData || !simulationData.length) return;
    // Also skip if percentile data is not populated
    if (!percentileData) return;
    // Also skip if there is no scenario or compartment selected
    if (!selectedScenario || !selectedCompartment) return;

    // Create empty map to match dates
    const dataMap = new Map<string, {[key: string]: number}>();

    // Cycle through scenarios
    activeScenarios?.forEach((scenarioId) => {
      if (simulationData[scenarioId]) {
        simulationData[scenarioId].results.forEach(({day, compartments}) => {
          // Add scenario data to map (upsert date entry)
          dataMap.set(day, {...dataMap.get(day), [scenarioId]: compartments[selectedCompartment]});
        });
      }
    });

    // Add case data values (upsert date entry)
    caseData?.results.forEach((entry) => {
      dataMap.set(entry.day, {...dataMap.get(entry.day), caseData: entry.compartments[selectedCompartment]});
    });

    // Add 25th percentile data
    percentileData[0].results?.forEach((entry: PercentileDataByDay) => {
      dataMap.set(entry.day, {...dataMap.get(entry.day), percentileDown: entry.compartments[selectedCompartment]});
    });

    // Add 75th percentile data
    percentileData[1].results?.forEach((entry: PercentileDataByDay) => {
      dataMap.set(entry.day, {...dataMap.get(entry.day), percentileUp: entry.compartments[selectedCompartment]});
    });

    // Add groupFilter data of visible filters
    if (groupFilterList && groupFilterData) {
      Object.values(groupFilterList).forEach((groupFilter) => {
        if (groupFilter && groupFilter.isVisible) {
          // Check if data for filter is available (else report error)
          if (groupFilterData[groupFilter.name]) {
            groupFilterData[groupFilter.name].results.forEach((entry: GroupData) => {
              dataMap.set(entry.day, {
                ...dataMap.get(entry.day),
                [groupFilter.name]: entry.compartments[selectedCompartment],
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
        <strong>{date.formatDate("${t('dateFormat')}")} (${tBackend(
      `infection-states.${selectedCompartment}`
    )})</strong>
        <table>
          ${
            // Table row for each series
            chartRef.current.series.values
              .map((series): string => {
                /* Skip if series:
                 * - is hidden
                 * - is percentile series (which is added to the active scenario series)
                 * - is group filter series
                 */
                if (
                  series.isHidden() ||
                  series.get('id') === 'percentiles' ||
                  series.get('id')?.startsWith('group-filter-')
                ) {
                  return '';
                }
                /* Skip with error if series does not have property:
                 * - id
                 * - name
                 * - valueYField
                 * - stroke
                 */
                if (!series.get('id') || !series.get('name') || !series.get('valueYField') || !series.get('stroke')) {
                  console.error(
                    'ERROR: missing series property: ',
                    series.get('id'),
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
                    // Add percentiles if this series is the selected scenario
                    series.get('id') !== selectedScenario.toString()
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
                  series.get('id') !== selectedScenario.toString()
                    ? ''
                    : // Add table row for each active group filter
                      (chartRef.current as XYChart).series.values
                        .filter((s) => s.get('id')?.startsWith('group-filter-') && !s.isHidden())
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
      date: `${t('chart.date')}`,
      caseData: `${t('chart.caseData')}`,
      percentileUp: `${t('chart.percentileUp')}`,
      percentileDown: `${t('chart.percentileDown')}`,
    };
    // Always put date first, case data second
    const dataFieldsOrder = ['date', 'caseData'];
    // Loop through active scenarios (if there are any)
    if (activeScenarios) {
      activeScenarios.forEach((scenario_id) => {
        // Add scenario label to export data field names
        dataFields = {
          ...dataFields,
          [scenario_id]: scenarioList.scenarios[scenario_id].label,
        };
        // Add scenario id to export data field order (for sorted export like csv)
        dataFieldsOrder.push(`${scenario_id}`);
        // If this is the selected scenario also add percentiles after it
        if (scenario_id == selectedScenario) {
          dataFieldsOrder.push('percentileDown', 'percentileUp');
        }
      });
    }
    // Update export menu
    Exporting.new(rootRef.current as Root, {
      menu: ExportingMenu.new(rootRef.current as Root, {}),
      filePrefix: 'Covid Simulation Data',
      dataSource: data,
      dateFields: ['date'],
      dateFormat: `${t('dateFormat')}`,
      dataFields: dataFields,
      dataFieldsOrder: dataFieldsOrder,
    });
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
    formatNumber,
    t,
    tBackend,
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
