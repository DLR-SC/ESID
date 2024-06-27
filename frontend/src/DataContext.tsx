// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {useGetSimulationStartValues} from 'components/ScenarioComponents/hooks';
import React, {useMemo} from 'react';
import {createContext, useState, useEffect} from 'react';
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
  SelectedScenarioPercentileData,
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
import {FeatureCollection, FeatureProperties} from 'types/map';
import cologneDistricts from '../assets/stadtteile_cologne.geojson?url';
import {District} from 'types/cologneDistricts';
import searchbarMapData from '../assets/lk_germany_reduced_list.json?url';
import searchbarCologneData from '../assets/stadtteile_cologne_list.json';
import {useTranslation} from 'react-i18next';
import {GroupResponse} from 'types/group';

// Create the context
export const DataContext = createContext<{
  geoData: FeatureCollection | undefined;
  mapData: {id: string; value: number}[] | undefined;
  areMapValuesFetching: boolean;
  searchBarData: FeatureProperties[] | undefined;
  chartCaseData: {day: string; value: number}[] | undefined;
  chartSimulationData: ({day: string; value: number}[] | null)[] | undefined;
  chartPercentileData: {day: string; value: number}[][] | undefined;
  chartGroupFilterData: Dictionary<{day: string; value: number}[]> | undefined;
  isChartDataFetching: boolean;
  selectedScenario: number | null;
  selectedCompartment: string | null;
  startValues: Dictionary<number> | null;
  groupCategories: GroupCategories | undefined;
  groupSubCategories: GroupSubcategories | undefined;
  scenarioListData: Simulations | undefined;
  referenceDay: string | null;
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
  chartCaseData: undefined,
  chartSimulationData: undefined,
  chartPercentileData: undefined,
  chartGroupFilterData: undefined,
  isChartDataFetching: false,
  selectedScenario: 0,
  selectedCompartment: '',
  startValues: {},
  groupCategories: undefined,
  groupSubCategories: undefined,
  scenarioListData: undefined,
  referenceDay: null,
  caseScenarioSimulationData: undefined,
  simulationModelData: undefined,
  caseScenarioData: undefined,
  scenarioSimulationDataForCardFiltersValues: undefined,
  getId: undefined,
  scenarioSimulationDataForCard: undefined,
});

// Create a provider component
export const DataProvider = ({children}: {children: React.ReactNode}) => {
  const {t} = useTranslation();
  const [geoData, setGeoData] = useState<FeatureCollection>();
  const [mapData, setMapData] = useState<{id: string; value: number}[] | undefined>(undefined);
  const [searchBarData, setSearchBarData] = useState<FeatureProperties[] | undefined>(undefined);
  const [processedChartCaseData, setProcessedChartCaseData] = useState<{day: string; value: number}[] | undefined>(
    undefined
  );
  const [processedChartSimulationData, setProcessedChartSimulationData] = useState<
    ({day: string; value: number}[] | null)[] | undefined
  >(undefined);
  const [processedChartPercentileData, setProcessedChartPercentileData] = useState<
    {day: string; value: number}[][] | undefined
  >(undefined);
  const [processedChartGroupFilterData, setProcessedChartGroupFilterData] = useState<
    Dictionary<{day: string; value: number}[]> | undefined
  >(undefined);
  const [simulationModelKey, setSimulationModelKey] = useState<string>('unset');

  const selectedDistrict = useAppSelector((state) => state.dataSelection.district.ags);
  const selectedScenario = useAppSelector((state) => state.dataSelection.scenario);
  const activeScenarios = useAppSelector((state) => state.dataSelection.activeScenarios);
  const selectedCompartment = useAppSelector((state) => state.dataSelection.compartment);
  const selectedDate = useAppSelector((state) => state.dataSelection.date);
  const groupFilterList = useAppSelector((state) => state.dataSelection.groupFilters);
  const scenarioList = useAppSelector((state) => state.scenarioList);
  const referenceDay = useAppSelector((state) => state.dataSelection.simulationStart);

  const startValues = useGetSimulationStartValues(selectedDistrict, referenceDay);

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
    {skip: selectedDate === null}
  );

  const {data: scenarioSimulationDataForCardFiltersValues} = useGetMultipleGroupFilterDataQuery(
    {
      ids: getId ?? [],
      node: selectedDistrict,
      day: selectedDate ?? '',
      groupFilterList: groupFilterList,
    },
    {skip: !selectedDate}
  );

  const {data: scenarioSimulationDataForCard} = useGetMultipleSimulationEntryQuery(
    {
      ids: getId ?? [],
      node: selectedDistrict,
      day: selectedDate ?? '',
      groups: ['total'],
    },
    {skip: !selectedDate}
  );

  const {data: mapSimulationData, isFetching: mapIsSimulationDataFetching} = useGetSimulationDataByDateQuery(
    {
      id: selectedScenario ?? 0,
      day: selectedDate ?? '',
      groups: ['total'],
      compartments: [selectedCompartment ?? ''],
    },
    {skip: selectedScenario === null || selectedScenario === 0 || !selectedCompartment || !selectedDate}
  );

  const {data: mapCaseData, isFetching: mapIsCaseDataFetching} = useGetCaseDataByDateQuery(
    {
      day: selectedDate ?? '',
      groups: ['total'],
      compartments: [selectedCompartment ?? ''],
    },
    {skip: selectedScenario === null || selectedScenario > 0 || !selectedCompartment || !selectedDate}
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
    {skip: !selectedCompartment || selectedDistrict === undefined}
  );

  const {data: chartCaseData, isFetching: chartCaseDataFetching} = useGetCaseDataByDistrictQuery(
    {
      node: selectedDistrict,
      groups: ['total'],
      compartments: [selectedCompartment ?? ''],
    },
    {skip: !selectedCompartment || selectedDistrict === undefined || Object.keys(selectedDistrict).length == 0}
  );

  const {data: chartPercentileData} = useGetPercentileDataQuery(
    {
      id: selectedScenario as number,
      node: selectedDistrict,
      groups: ['total'],
      compartment: selectedCompartment as string,
    },
    {
      skip:
        selectedScenario === null ||
        selectedScenario === 0 ||
        !selectedCompartment ||
        selectedDistrict === undefined ||
        Object.keys(selectedDistrict).length == 0,
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
    {skip: !selectedDistrict || selectedDistrict === undefined || Object.keys(selectedDistrict).length == 0}
  );

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
        setGeoData(geodata as FeatureCollection);
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
        (geojson: FeatureCollection) => {
          setGeoData(geojson);
        },
        // reject promise
        () => {
          console.warn('Failed to fetch geoJSON');
        }
      );
  }, []);

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
        (jsonlist: FeatureProperties[]) => {
          /* [CDtemp-begin] */
          // append germany to list
          jsonlist.push({RS: '00000', GEN: t('germany'), BEZ: ''});
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
          jsonlist.sort((a: FeatureProperties, b: FeatureProperties) => {
            return a.GEN.toString().localeCompare(b.GEN.toString());
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
  }, [t]);

  useEffect(() => {
    if (simulationModelsData && simulationModelsData.results.length > 0) {
      const {key} = simulationModelsData.results[0];
      setSimulationModelKey(key);
    }
  }, [simulationModelsData]);

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
  }, [mapSimulationData, selectedCompartment, mapCaseData, selectedScenario]);

  useEffect(() => {
    if (chartCaseData && chartCaseData.results && chartCaseData.results.length > 0 && selectedCompartment) {
      setProcessedChartCaseData(
        chartCaseData.results.map((element: {day: string; compartments: {[key: string]: number}}) => {
          return {day: element.day, value: element.compartments[selectedCompartment]} as {day: string; value: number};
        })
      );
    }
    if (chartSimulationData && chartSimulationData.length > 0 && selectedCompartment) {
      setProcessedChartSimulationData(
        chartSimulationData.map((element: SimulationDataByNode | null) => {
          if (element && element.results && element.results.length > 0) {
            return element.results.map((element: {day: string; compartments: {[key: string]: number}}) => {
              return {day: element.day, value: element.compartments[selectedCompartment]} as {
                day: string;
                value: number;
              };
            });
          }
          return [];
        })
      );
    }
    if (chartPercentileData && chartPercentileData.length > 0 && selectedCompartment) {
      setProcessedChartPercentileData(
        chartPercentileData.map((element: SelectedScenarioPercentileData) => {
          return element.results!.map((element: {day: string; compartments: {[key: string]: number}}) => {
            return {day: element.day, value: element.compartments[selectedCompartment]} as {day: string; value: number};
          });
        })
      );
    }
    if (chartGroupFilterData && Object.keys(chartGroupFilterData).length > 0 && selectedCompartment) {
      const processedData: Dictionary<{day: string; value: number}[]> = {};
      Object.keys(chartGroupFilterData).forEach((key) => {
        processedData[key] = chartGroupFilterData[key].results.map(
          (element: {day: string; compartments: {[key: string]: number}}) => {
            return {day: element.day, value: element.compartments[selectedCompartment]} as {
              day: string;
              value: number;
            };
          }
        );
      });
      setProcessedChartGroupFilterData(processedData);
    }
  }, [chartCaseData, chartGroupFilterData, chartPercentileData, chartSimulationData, selectedCompartment]);

  return (
    <DataContext.Provider
      value={{
        geoData: geoData,
        mapData: mapData,
        areMapValuesFetching: mapIsCaseDataFetching || mapIsSimulationDataFetching,
        searchBarData: searchBarData,
        chartCaseData: processedChartCaseData,
        chartSimulationData: processedChartSimulationData,
        chartPercentileData: processedChartPercentileData,
        chartGroupFilterData: processedChartGroupFilterData,
        isChartDataFetching: chartCaseDataFetching || chartSimulationFetching,
        selectedScenario,
        selectedCompartment,
        startValues,
        groupCategories,
        groupSubCategories,
        scenarioListData,
        referenceDay,
        caseScenarioSimulationData: caseScenarioSimulationData.data,
        simulationModelData: simulationModelData?.results,
        caseScenarioData,
        scenarioSimulationDataForCardFiltersValues,
        getId,
        scenarioSimulationDataForCard: scenarioSimulationDataForCard,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
