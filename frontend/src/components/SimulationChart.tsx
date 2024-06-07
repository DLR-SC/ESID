// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {useLayoutEffect, useMemo} from 'react';
import {Root} from '@amcharts/amcharts5/.internal/core/Root';
import {Tooltip} from '@amcharts/amcharts5/.internal/core/render/Tooltip';
import {Color, color} from '@amcharts/amcharts5/.internal/core/util/Color';
import {DataProcessor} from '@amcharts/amcharts5/.internal/core/util/DataProcessor';
import {XYChart} from '@amcharts/amcharts5/.internal/charts/xy/XYChart';
import {DateAxis} from '@amcharts/amcharts5/.internal/charts/xy/axes/DateAxis';
import {AxisRendererY} from '@amcharts/amcharts5/.internal/charts/xy/axes/AxisRendererY';
import {LineSeries} from '@amcharts/amcharts5/.internal/charts/xy/series/LineSeries';
import {useAppSelector} from '../store/hooks';
import {useTheme} from '@mui/material/styles';
import Box from '@mui/material/Box';
import {useGetCaseDataByDistrictQuery} from '../store/services/caseDataApi';
import {
  PercentileDataByDay,
  useGetMultipleSimulationDataByNodeQuery,
  useGetPercentileDataQuery,
} from 'store/services/scenarioApi';
import {useTranslation} from 'react-i18next';
import LoadingContainer from './shared/LoadingContainer';
import {useGetMultipleGroupFilterDataQuery} from 'store/services/groupApi';
import {GroupData} from 'types/group';
import {AxisRenderer} from '@amcharts/amcharts5/.internal/charts/xy/axes/AxisRenderer';
import useValueAxis from './shared/chart/ValueAxis';
import useTimeSeriesChart from './shared/TimeSeriesChart';
import useLineSeries, {useLineSeriesList} from './shared/chart/LineSeries';
import {useConst} from '../util/hooks';

export default function StandaloneSimulationChart(): JSX.Element {
  const theme = useTheme();
  const {root, chart, xAxis} = useTimeSeriesChart('chartdiv');
  useSimulationChart(root, chart, xAxis);

  return (
    <LoadingContainer sx={{width: '100%', height: '100%'}} show={false} overlayColor={theme.palette.background.paper}>
      <Box
        id='chartdiv'
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
    </LoadingContainer>
  );
}

/**
 * React Component to render the Simulation Chart Section
 */
export function useSimulationChart(root: Root | null, chart: XYChart | null, xAxis: DateAxis<AxisRenderer> | null) {
  const {t} = useTranslation();
  const {t: tBackend} = useTranslation('backend');
  const theme = useTheme();

  const scenarioList = useAppSelector((state) => state.scenarioList);
  const selectedDistrict = useAppSelector((state) => state.dataSelection.district.ags);
  const selectedCompartment = useAppSelector((state) => state.dataSelection.compartment);
  const selectedScenario = useAppSelector((state) => state.dataSelection.scenario);
  const activeScenarios = useAppSelector((state) => state.dataSelection.activeScenarios);
  const groupFilterList = useAppSelector((state) => state.dataSelection.groupFilters);

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

  const {data: caseData /*, isFetching: caseDataFetching*/} = useGetCaseDataByDistrictQuery(
    {
      node: selectedDistrict,
      groups: ['total'],
      compartments: [selectedCompartment ?? ''],
    },
    {skip: !selectedCompartment}
  );

  const {data: simulationData /*, isFetching: simulationFetching*/} = useGetMultipleSimulationDataByNodeQuery(
    {
      // Filter only scenarios (scenario id 0 is case data)
      ids: activeScenarios ? activeScenarios.filter((s) => s !== 0 && scenarioList.scenarios[s]) : [],
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
    {skip: selectedScenario === null || selectedScenario === 0 || !selectedCompartment}
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

  const caseDataSeriesSettings = useMemo(() => {
    if (!xAxis || !yAxis) {
      return null;
    }

    return {
      xAxis: xAxis,
      yAxis: yAxis,
      // Case Data is always scenario id 0
      id: '0',
      name: t('chart.caseData'),
      valueXField: 'date',
      valueYField: '0',
      // Prevent data points from connecting across gaps in the data
      connect: false,
      stroke: color('#000'),
    };
  }, [t, xAxis, yAxis]);
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
    if (!xAxis || !yAxis) {
      return null;
    }

    return {
      xAxis: xAxis,
      yAxis: yAxis,
      id: 'percentiles',
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
    };
  }, [selectedScenario, theme.custom.scenarios, xAxis, yAxis]);
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
    if (!root || !xAxis || !yAxis) {
      return [];
    }

    return Object.entries(scenarioList.scenarios).map(([scenarioId, scenario]) => ({
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
        labelText: `[bold ${theme.custom.scenarios[scenario.id % theme.custom.scenarios.length][0]}]${tBackend(
          `scenario-names.${scenario.label}`
        )}:[/] {${scenarioId}}`,
      }),
      stroke: color(theme.custom.scenarios[scenario.id % theme.custom.scenarios.length][0]),
    }));
  }, [root, scenarioList.scenarios, tBackend, theme.custom.scenarios, xAxis, yAxis]);
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

  const groupFilterStrokes = [
    [2, 4], // dotted
    [8, 4], // dashed
    [8, 4, 2, 4], // dash-dotted
    [8, 4, 2, 4, 2, 4], // dash-dot-dotted
  ];

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
        id: `group-filter-${groupFilter.name}`,
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
      }));
  }, [groupFilterList, root, selectedScenario, theme.custom.scenarios, xAxis, yAxis]);
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
        const seriesID = series.get('id');
        // Hide series if it is a scenario series (and in the scenario list) but not in the active scenarios list
        if (seriesID === 'percentiles') {
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
    [activeScenarios, chart?.series]
  );

  // Effect to hide deviations if no scenario is selected
  useLayoutEffect(
    () => {
      // Skip effect if chart is not initialized (contains no series yet)
      if (!chart) return;

      // Find percentile series and only show it if there is a selected scenario
      chart?.series.values
        .filter((series) => series.get('id') === 'percentiles')
        .map((percentileSeries) => {
          if (selectedScenario === null || selectedScenario === 0) {
            void percentileSeries.hide();
          } else {
            void percentileSeries.show();
          }
        });
    },
    // Re-run effect when the selected scenario changes
    [chart, selectedScenario]
  );

  // Effect to update Simulation and case data
  useLayoutEffect(() => {
    // Skip effect if chart is not initialized yet
    if (!chart) return;
    // Also skip if there is no scenario or compartment selected
    if (selectedScenario === null || !selectedCompartment) return;

    // Create empty map to match dates
    const dataMap = new Map<string, {[key: string]: number}>();

    // Cycle through scenarios
    activeScenarios?.forEach((scenarioId) => {
      simulationData?.[scenarioId]?.results.forEach(({day, compartments}) => {
        // Add scenario data to map (upsert date entry)
        dataMap.set(day, {...dataMap.get(day), [scenarioId]: compartments[selectedCompartment]});
      });

      if (scenarioId === 0) {
        // Add case data values (upsert date entry)
        caseData?.results.forEach((entry) => {
          dataMap.set(entry.day, {...dataMap.get(entry.day), [0]: entry.compartments[selectedCompartment]});
        });
      }
    });

    if (percentileData) {
      // Add 25th percentile data
      percentileData[0].results?.forEach((entry: PercentileDataByDay) => {
        dataMap.set(entry.day, {...dataMap.get(entry.day), percentileDown: entry.compartments[selectedCompartment]});
      });

      // Add 75th percentile data
      percentileData[1].results?.forEach((entry: PercentileDataByDay) => {
        dataMap.set(entry.day, {...dataMap.get(entry.day), percentileUp: entry.compartments[selectedCompartment]});
      });
    }

    // Add groupFilter data of visible filters
    if (groupFilterList && groupFilterData) {
      Object.values(groupFilterList).forEach((groupFilter) => {
        if (groupFilter?.isVisible) {
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
    chart.series.each((series, i) => {
      if (!(series instanceof LineSeries)) {
        return;
      }

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
        <strong>{date.formatDate("${t('dateFormat')}")} (${tBackend(
          `infection-states.${selectedCompartment}`
        )})</strong>
        <table>
          ${
            // Table row for each series of an active scenario
            chart.series.values
              .filter((series) => activeScenarios?.includes(Number(series.get('id'))))
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
                    // Skip percentiles if this series is not the selected scenario or case data
                    series.get('id') !== selectedScenario.toString() || selectedScenario === 0
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
                      chart.series.values
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
      date: `${t('chart.date')}`,
      caseData: `${t('chart.caseData')}`,
      percentileUp: `${t('chart.percentileUp')}`,
      percentileDown: `${t('chart.percentileDown')}`,
    };
    // Always put date first, case data second
    const dataFieldsOrder = ['date', 'caseData'];
    // Loop through active scenarios (if there are any)
    if (activeScenarios) {
      activeScenarios.forEach((scenarioId) => {
        // Skip case data (already added)
        if (scenarioId === 0 || !scenarioList.scenarios[scenarioId]) {
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
          filePrefix: 'Covid Simulation Data',
          dataSource: data,
          dateFields: ['date'],
          dateFormat: `${t('dateFormat')}`,
          dataFields: dataFields,
          dataFieldsOrder: dataFieldsOrder,
        });
      })
      .catch(() => console.warn("Couldn't load exporting functionality!"));
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
    t,
    tBackend,
    chart,
    root,
  ]);
}
