// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {useGetSimulationStartValues} from 'components/ScenarioComponents/hooks';
import React, {createContext, useState, useEffect, useMemo} from 'react';
import {useAppSelector} from 'store/hooks';
import {
  useGetCaseDataByDateQuery,
  useGetCaseDataByDistrictQuery,
  useGetCaseDataSingleSimulationEntryQuery,
} from 'store/services/caseDataApi';
import {
  useGetMultipleGroupFilterDataQuery,
  useGetGroupCategoriesQuery,
  useGetGroupSubcategoriesQuery,
  useGetMultipleGroupFilterDataLineChartQuery,
  GroupCategories,
  GroupSubcategories,
} from 'store/services/groupApi';
import {
  useGetPercentileDataQuery,
  useGetSimulationDataByDateQuery,
  useGetMultipleSimulationDataByNodeQuery,
  useGetSimulationModelQuery,
  useGetSimulationModelsQuery,
  useGetSimulationsQuery,
  useGetMultipleSimulationEntryQuery,
} from 'store/services/scenarioApi';
import {CaseDataByNode} from 'types/caseData';
import {Simulations, SimulationModel, SimulationDataByNode, SimulationMetaData} from 'types/scenario';
import {Dictionary} from 'util/util';
import data from '../assets/lk_germany_reduced.geojson?url';
import {GeoJSON, GeoJsonProperties} from 'geojson';
import cologneDistricts from '../assets/stadtteile_cologne.geojson?url';
import {District} from 'types/cologneDistricts';
import searchbarMapData from '../assets/lk_germany_reduced_list.json?url';
import searchbarCologneData from '../assets/stadtteile_cologne_list.json';
import {useTranslation} from 'react-i18next';
import {GroupResponse} from 'types/group';
import {color} from '@amcharts/amcharts5/.internal/core/util/Color';
import {getScenarioPrimaryColor} from 'util/Theme';
import {useTheme} from '@mui/material';
import {LineChartData} from 'types/lineChart';

// Create the context
export const DataContext = createContext<{
  geoData: GeoJSON | undefined;
  mapData: {id: string; value: number}[] | undefined;
  areMapValuesFetching: boolean;
  searchBarData: GeoJsonProperties[] | undefined;
  chartData: LineChartData[] | undefined;
  isChartDataFetching: boolean;
  startValues: Dictionary<number> | null;
  groupCategories: GroupCategories | undefined;
  groupSubCategories: GroupSubcategories | undefined;
  scenarioListData: Simulations | undefined;
  caseScenarioSimulationData: CaseDataByNode | undefined;
  simulationModelData: SimulationModel | undefined;
  caseScenarioData: SimulationDataByNode | undefined;
  scenarioSimulationDataForCardFiltersValues: Dictionary<GroupResponse>[] | undefined;
  getId: number[] | undefined;
  scenarioSimulationDataForCard: (SimulationDataByNode | undefined)[] | undefined;
}>({
  geoData: undefined,
  mapData: undefined,
  areMapValuesFetching: false,
  searchBarData: undefined,
  chartData: undefined,
  isChartDataFetching: false,
  startValues: null,
  groupCategories: undefined,
  groupSubCategories: undefined,
  scenarioListData: undefined,
  caseScenarioSimulationData: undefined,
  simulationModelData: undefined,
  caseScenarioData: undefined,
  scenarioSimulationDataForCardFiltersValues: undefined,
  getId: undefined,
  scenarioSimulationDataForCard: undefined,
});

// Create a provider component
export const DataProvider = ({children}: {children: React.ReactNode}) => {
  const {t: defaultT} = useTranslation();
  const {t: backendT} = useTranslation('backend');
  const theme = useTheme();

  const [geoData, setGeoData] = useState<GeoJSON>();
  const [mapData, setMapData] = useState<{id: string; value: number}[] | undefined>(undefined);
  const [searchBarData, setSearchBarData] = useState<GeoJsonProperties[] | undefined>(undefined);
  const [simulationModelKey, setSimulationModelKey] = useState<string>('unset');
  const [chartData, setChartData] = useState<LineChartData[] | undefined>(undefined);

  const selectedDistrict = useAppSelector((state) => state.dataSelection.district.ags);
  const selectedScenario = useAppSelector((state) => state.dataSelection.scenario);
  const activeScenarios = useAppSelector((state) => state.dataSelection.activeScenarios);
  const selectedCompartment = useAppSelector((state) => state.dataSelection.compartment);
  const selectedDate = useAppSelector((state) => state.dataSelection.date);
  const groupFilterList = useAppSelector((state) => state.dataSelection.groupFilters);
  const scenarioList = useAppSelector((state) => state.scenarioList);

  const startValues = useGetSimulationStartValues(selectedDistrict);

  const caseScenarioSimulationData = useGetCaseDataByDistrictQuery({
    node: '00000',
    groups: null,
    compartments: null,
  });

  const {data: groupCategories} = useGetGroupCategoriesQuery();

  const {data: groupSubCategories} = useGetGroupSubcategoriesQuery();

  const {data: scenarioListData} = useGetSimulationsQuery();

  const getId = useMemo(() => {
    return scenarioListData?.results.map((simulation: SimulationMetaData) => {
      return simulation.id;
    });
  }, [scenarioListData?.results]);

  const {data: simulationModelsData} = useGetSimulationModelsQuery();

  const {data: simulationModelData} = useGetSimulationModelQuery(simulationModelKey, {
    skip: simulationModelKey === 'unset',
  });

  const {data: caseScenarioData} = useGetCaseDataSingleSimulationEntryQuery(
    {
      node: selectedDistrict,
      day: selectedDate ?? '',
      groups: ['total'],
    },
    {skip: selectedDate === null || !selectedDistrict}
  );

  const {data: scenarioSimulationDataForCardFiltersValues} = useGetMultipleGroupFilterDataQuery(
    {
      ids: getId ?? [],
      node: selectedDistrict,
      day: selectedDate ?? '',
      groupFilterList: groupFilterList,
    },
    {skip: !selectedDate || !selectedDistrict}
  );

  const {data: scenarioSimulationDataForCard} = useGetMultipleSimulationEntryQuery(
    {
      ids: getId ?? [],
      node: selectedDistrict,
      day: selectedDate ?? '',
      groups: ['total'],
    },
    {skip: !selectedDate || !selectedDistrict}
  );

  const {currentData: mapSimulationData, isFetching: mapIsSimulationDataFetching} = useGetSimulationDataByDateQuery(
    {
      id: selectedScenario ?? 0,
      day: selectedDate ?? '',
      groups: ['total'],
      compartments: [selectedCompartment ?? ''],
    },
    {skip: selectedScenario == null || selectedScenario === 0 || !selectedCompartment || !selectedDate}
  );

  const {currentData: mapCaseData, isFetching: mapIsCaseDataFetching} = useGetCaseDataByDateQuery(
    {
      day: selectedDate ?? '',
      groups: ['total'],
      compartments: [selectedCompartment ?? ''],
    },
    {skip: selectedScenario == null || selectedScenario > 0 || !selectedCompartment || !selectedDate}
  );

  const {data: chartSimulationData, isFetching: chartSimulationFetching} = useGetMultipleSimulationDataByNodeQuery(
    {
      // Filter only scenarios (scenario id 0 is case data)
      ids: activeScenarios
        ? activeScenarios.filter((s: number) => {
            return (
              s !== 0 &&
              (scenarioList.scenarios[s] as {
                id: number;
                label: string;
              })
            );
          })
        : [],
      node: selectedDistrict,
      groups: ['total'],
      compartments: [selectedCompartment ?? ''],
    },
    {skip: !selectedCompartment || !selectedDistrict}
  );

  const {data: chartCaseData, isFetching: chartCaseDataFetching} = useGetCaseDataByDistrictQuery(
    {
      node: selectedDistrict,
      groups: ['total'],
      compartments: [selectedCompartment ?? ''],
    },
    {skip: !selectedCompartment || !selectedDistrict}
  );

  const {data: chartPercentileData} = useGetPercentileDataQuery(
    {
      id: selectedScenario as number,
      node: selectedDistrict,
      groups: ['total'],
      compartment: selectedCompartment as string,
    },
    {
      skip: selectedScenario === null || selectedScenario === 0 || !selectedCompartment || !selectedDistrict,
    }
  );

 

  const {data: chartGroupFilterData} = useGetMultipleGroupFilterDataLineChartQuery(
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
      : [],
    {
      skip: !selectedDistrict || selectedScenario === null || selectedScenario === 0,
    }
  );

  // Effect to fetch the geoJSON files for the map displays.
  useEffect(() => {
    /* [CDtemp-begin] */
    // Fetch both in one Promise
    Promise.all([
      fetch(data, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }).then((result) => result.json()),
      fetch(cologneDistricts, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }).then((result) => result.json()),
    ]).then(
      // on promises accept
      ([geodata, colognedata]: [GeoJSON.FeatureCollection, GeoJSON.FeatureCollection]) => {
        // Remove Cologne from data
        geodata.features = geodata.features.filter((feat) => feat.properties!['RS'] !== '05315');
        // Add RS, GEN, BEZ to cologne districts
        geodata.features.push(
          ...colognedata.features.map((feat) => {
            // Append Stadtteil ID to AGS
            feat.properties!['RS'] = `05315${feat.properties!['Stadtteil_ID']}`;
            // Append Name (e.g. Köln - Braunsfeld (Lindenthal))
            feat.properties!['GEN'] = `Köln - ${feat.properties!['Stadtteil']} (${feat.properties!['Stadtbezirk']})`;
            // Use ST for Stadtteil
            feat.properties!['BEZ'] = 'ST';
            return feat;
          })
        );
        setGeoData(geodata as GeoJSON);
      },
      // on promises reject
      () => {
        console.warn('Failed to fetch geoJSON');
      }
    );
    /* [CDtemp-end] */
    fetch(data, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })
      .then((response) => response.json())
      .then(
        // resolve Promise
        (geojson: GeoJSON) => {
          setGeoData(geojson);
        },
        // reject promise
        () => {
          console.warn('Failed to fetch geoJSON');
        }
      );
    // This should only run once when the page loads
  }, []);

  // This effect fetches the list of available districts (nodes) for the search bar.
  useEffect(() => {
    // get option list from assets
    fetch(searchbarMapData, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })
      .then((response) => {
        // interpret content as JSON
        return response.json();
      })
      .then(
        // Resolve Promise
        (jsonlist: GeoJsonProperties[]) => {
          /* [CDtemp-begin] */
          // append germany to list
          jsonlist.push({RS: '00000', GEN: defaultT('germany'), BEZ: ''} as unknown as District);
          // append city districts
          jsonlist.push(
            ...(searchbarCologneData as unknown as Array<District>).map((dist) => {
              return {
                RS: `05315${dist.Stadtteil_ID}`,
                GEN: `Köln - ${dist.Stadtteil} (${dist.Stadtbezirk})`,
                BEZ: 'ST',
              };
            })
          );
          /* [CDtemp-end] */
          // sort list to put germany at the right place (loading and sorting takes 1.5 ~ 2 sec)
          jsonlist.sort((a: GeoJsonProperties, b: GeoJsonProperties) => {
            return String(a!.GEN).localeCompare(String(b!.GEN));
          });
          // fill countyList state with list
          setSearchBarData(jsonlist);
        },
        // Reject Promise
        () => {
          console.warn('Did not receive proper county list');
        }
      );
    // this init should only run once on first render
  }, [defaultT]);

  // This useEffect is used in order to set the SimulationModelKey
  useEffect(() => {
    if (simulationModelsData && simulationModelsData.results.length > 0) {
      const {key} = simulationModelsData.results[0];
      setSimulationModelKey(key);
    }
    // This effect should re-run whenever simulationModelsData changes.
  }, [simulationModelsData]);

  // This effect sets the data for the map according to the selections.
  useEffect(() => {
    if (mapSimulationData && selectedCompartment && selectedScenario) {
      setMapData(
        mapSimulationData.results
          .filter((element: {name: string}) => {
            return element.name != '00000';
          })
          .map((element: {name: string; compartments: {[key: string]: number}}) => {
            return {id: element.name, value: element.compartments[selectedCompartment]} as {id: string; value: number};
          })
      );
    } else if (mapCaseData && selectedCompartment) {
      setMapData(
        mapCaseData.results
          .filter((element: {name: string}) => {
            return element.name != '00000';
          })
          .map((element: {name: string; compartments: {[key: string]: number}}) => {
            return {id: element.name, value: element.compartments[selectedCompartment]};
          })
      );
    }
    // This effect should re-run whenever there is new data or the selected card or compartment changed.
  }, [mapSimulationData, selectedCompartment, mapCaseData, selectedScenario]);

  // This effect sets the chart case data based on the selection.
  useEffect(() => {
    let lineChartData: LineChartData | null = null;
    if (
      chartCaseData &&
      chartCaseData.results &&
      chartCaseData.results.length > 0 &&
      selectedCompartment &&
      activeScenarios &&
      activeScenarios.includes(0)
    ) {
      // Process the case data for the selected compartment
      const processedChartCaseData = chartCaseData.results.map(
        (element: {day: string; compartments: {[key: string]: number}}) => {
          return {day: element.day, value: element.compartments[selectedCompartment]} as {day: string; value: number};
        }
      );
      // Push the processed case data into the line chart data
      lineChartData = {
        values: processedChartCaseData,
        name: defaultT('chart.caseData'),
        valueYField: 0,
        stroke: {color: color('#000')},
        serieId: 0,
      };
    }
    // Update the chart data state with the new line chart data
    setChartData((prevData) => {
      if (prevData && prevData.length > 0) {
        const seriesWithoutCase = prevData.filter((serie) => serie.serieId !== 0);
        if (seriesWithoutCase.length > 0 && lineChartData) return [lineChartData, ...seriesWithoutCase];
        else if (seriesWithoutCase.length) return [...seriesWithoutCase];
      }
      if (lineChartData) return [lineChartData];
      return [];
    });
    // This should re-run whenever the case data changes, or a different compartment is selected.
  }, [chartCaseData, selectedCompartment, activeScenarios, defaultT]);

  // This effect sets the chart simulation data based on the selection.
  useEffect(() => {
    const lineChartData: LineChartData[] = [];
    if (chartSimulationData && chartSimulationData.length > 0 && selectedCompartment && activeScenarios) {
      // Process the simulation data for the selected compartment
      const processedChartSimulationData = chartSimulationData.map((element: SimulationDataByNode | null) => {
        if (element && element.results && element.results.length > 0) {
          return element.results.map((element: {day: string; compartments: {[key: string]: number}}) => {
            return {day: element.day, value: element.compartments[selectedCompartment]} as {day: string; value: number};
          });
        }
        return [];
      });
      // Define the scenario names for the simulation data
      const scenarioNames = Object.values(scenarioList.scenarios)
        .filter((scenario) => activeScenarios.includes(scenario.id))
        .map((scenario) => backendT(`scenario-names.${scenario.label}`));
      let scenarioNamesIndex = 0;
      // Push the processed simulation data into the line chart data
      for (let i = 0; i < processedChartSimulationData.length; i++) {
        if (processedChartSimulationData[i] && scenarioNames[scenarioNamesIndex]) {
          lineChartData.push({
            values: processedChartSimulationData[i],
            name: scenarioNames[scenarioNamesIndex],
            stroke: {color: color(getScenarioPrimaryColor(i, theme))},
            serieId: i,
            valueYField: i,
            tooltipText: `[bold ${getScenarioPrimaryColor(i, theme)}]${scenarioNames[scenarioNamesIndex++]}:[/] {${i}}`,
          });
        }
      }
    }
    // Update the chart data state with the new line chart data
    setChartData((prevData) => {
      if (prevData && prevData.length > 0) {
        const seriesWithoutScenarios = prevData.filter(
          (serie) => typeof serie.serieId === 'string' || serie.serieId === 0
        );
        if (seriesWithoutScenarios.length > 0) return [...seriesWithoutScenarios, ...lineChartData];
      }
      return lineChartData;
    });
    // This should re-run whenever the simulation data changes, or a different compartment is selected.
  }, [chartSimulationData, selectedCompartment, theme, activeScenarios, scenarioList, backendT]);

  
  // This effect sets the chart group filter data based on the selection.
  useEffect(() => {
    const lineChartData: LineChartData[] = [];
    if (
      chartGroupFilterData &&
      Object.keys(chartGroupFilterData).length > 0 &&
      selectedCompartment &&
      selectedScenario
    ) {
      const processedData: Dictionary<{day: string; value: number}[]> = {};
      // Process the group filter data for the selected compartment
      Object.keys(chartGroupFilterData).forEach((key) => {
        processedData[key] = chartGroupFilterData[key].results.map(
          (element: {day: string; compartments: {[key: string]: number}}) => {
            return {day: element.day, value: element.compartments[selectedCompartment]} as {day: string; value: number};
          }
        );
      });
      // Define stroke styles for different group filters
      const groupFilterStrokes = [
        [2, 4], // dotted
        [8, 4], // dashed
        [8, 4, 2, 4], // dash-dotted
        [8, 4, 2, 4, 2, 4], // dash-dot-dotted
      ];
      // Push the processed group filter data into the line chart data
      for (let i = 0; i < Object.keys(processedData).length; i++) {
        lineChartData.push({
          values: processedData[Object.keys(processedData)[i]],
          name: Object.keys(processedData)[i],
          stroke: {
            color: color(getScenarioPrimaryColor(selectedScenario, theme)),
            strokeDasharray: groupFilterStrokes[i % groupFilterStrokes.length],
          },
          serieId: `group-filter-${Object.keys(processedData)[i]}`,
          valueYField: Object.keys(processedData)[i],
          tooltipText: `[bold ${getScenarioPrimaryColor(selectedScenario, theme)}]${Object.keys(processedData)[i]}:[/] {${Object.keys(processedData)[i]}}`,
          parentId: selectedScenario,
        });
      }
    }
    // Update the chart data state with the new line chart data
    setChartData((prevData) => {
      if (prevData && prevData.length > 0) {
        const seriesWithoutGroup = prevData.filter(
          (serie) => typeof serie.serieId === 'number' || !serie.serieId.startsWith('group-filter')
        );
        if (seriesWithoutGroup.length > 0) return [...seriesWithoutGroup, ...lineChartData];
      }
      return lineChartData;
    });
    // This should re-run whenever the group filter data changes, or a different compartment is selected.
  }, [chartGroupFilterData, selectedCompartment, selectedScenario, theme, groupFilterList]);

  

  // This effect sets the chart percentile data based on the selection.  
  useEffect(() => {
    const lineChartData: LineChartData[] = [];
    
    if (chartPercentileData?.length != undefined && chartPercentileData?.length > 0 && selectedCompartment && selectedScenario) {
      // Array to hold processed data arrays for each percentile range
      const processedDataArrays = [[], [], [], [], []] as Array<{ day: string; value: number[] }[]>;
  
      const indexPairs = [
        [0, 1], [1, 2], [2, 3], [3, 4], [4, 5]
      ]; // Pairs of indexes to compare days and process percentile data
  
      for (let i = 0; chartPercentileData[0]?.results && i < Object.keys(chartPercentileData[0].results).length; i++) {
        indexPairs.forEach(([lowIndex, highIndex], dataIdx) => {
          const lowResult = Object.values(chartPercentileData[lowIndex]?.results || [])[i];
          const highResult = Object.values(chartPercentileData[highIndex]?.results || [])[i];
          
          if (lowResult?.day === highResult?.day) {
            processedDataArrays[dataIdx].push({
              day: lowResult.day,
              value: [
                lowResult.compartments[selectedCompartment],
                highResult.compartments[selectedCompartment],
              ],
            });
          }
        });
      }
  
      // Define the chart series with respective fill opacities
      const seriesConfigs = [
        { dataIdx: 0, fillOpacity: 0.2, serieId: 'percentiles90Lower', valueYField: 'percentileUp15', openValueYField: 'percentileDown5' },
        { dataIdx: 1, fillOpacity: 0.3, serieId: 'percentiles70Lower', valueYField: 'percentileUp25', openValueYField: 'percentileDown15' },
        { dataIdx: 2, fillOpacity: 0.4, serieId: 'percentiles50', valueYField: 'percentileUp75', openValueYField: 'percentileDown25' },
        { dataIdx: 3, fillOpacity: 0.3, serieId: 'percentiles70Upper', valueYField: 'percentileUp85', openValueYField: 'percentileDown75' },
        { dataIdx: 4, fillOpacity: 0.2, serieId: 'percentiles90Upper', valueYField: 'percentileUp95', openValueYField: 'percentileDown85' },
      ];
  
      seriesConfigs.forEach(({ dataIdx, fillOpacity, serieId, valueYField, openValueYField }) => {
        if (processedDataArrays[dataIdx].length > 0) {
          lineChartData.push({
            values: processedDataArrays[dataIdx],
            serieId,
            valueYField,
            openValueYField,
            visible: true,
            fill: color(getScenarioPrimaryColor(selectedScenario, theme)),
            fillOpacity,
            stroke: { strokeWidth: 0 },
            parentId: selectedScenario,
          });
        }
      });
    }
  
    setChartData((prevData) => {
      if (prevData && prevData.length > 0) {
        const seriesWithoutPercentiles = prevData.filter(
          (serie) => typeof serie.serieId === 'number' || !serie.serieId.startsWith('percentile')
        );
        if (seriesWithoutPercentiles.length > 0 && lineChartData.length > 0) {
          return [...seriesWithoutPercentiles, ...lineChartData];
        }
        return seriesWithoutPercentiles.length > 0 ? seriesWithoutPercentiles : lineChartData;
      }
      return lineChartData;
    });
  }, [chartPercentileData, selectedCompartment, selectedScenario, theme]);
  

  return (
    <DataContext.Provider
      value={{
        geoData,
        mapData,
        areMapValuesFetching: mapIsCaseDataFetching || mapIsSimulationDataFetching,
        searchBarData,
        chartData,
        isChartDataFetching: chartCaseDataFetching || chartSimulationFetching,
        startValues,
        groupCategories,
        groupSubCategories,
        scenarioListData,
        caseScenarioSimulationData: caseScenarioSimulationData.data,
        simulationModelData: simulationModelData?.results,
        caseScenarioData,
        scenarioSimulationDataForCardFiltersValues,
        getId,
        scenarioSimulationDataForCard,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
