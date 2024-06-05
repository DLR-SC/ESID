// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {useGetSimulationStartValues} from 'components/Scenario/hooks';
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
  GroupCategories,
  GroupSubcategories,
  PostFilter,
} from 'store/services/groupApi';
import {
  SelectedScenarioPercentileData,
  useGetPercentileDataQuery,
  useGetSimulationDataByDateQuery,
  useGetMultipleSimulationDataByNodeQuery,
  useGetSimulationModelQuery,
  useGetSimulationModelsQuery,
  useGetSimulationsQuery,
  useGetSingleSimulationEntryQuery,
} from 'store/services/scenarioApi';
import {CaseDataByNode} from 'types/caseData';
import {GroupResponse} from 'types/group';
import {Simulations, SimulationModel, SimulationDataByNode} from 'types/scenario';
import {Dictionary} from 'util/util';

// Create the context
export const DataContext = createContext<{
  mapData: {id: string; value: number}[] | undefined;
  areMapValuesFetching: boolean;
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
  scenarioSimulationDataFirstCard: SimulationDataByNode | undefined;
  scenarioSimulationDataSecondCard: SimulationDataByNode | undefined;
  scenarioSimulationDataFirstCardFiltersValues: Dictionary<GroupResponse> | undefined;
  scenarioSimulationDataSecondCardFiltersValues: Dictionary<GroupResponse> | undefined;
}>({
  mapData: undefined,
  areMapValuesFetching: false,
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
  scenarioSimulationDataFirstCard: undefined,
  scenarioSimulationDataSecondCard: undefined,
  scenarioSimulationDataFirstCardFiltersValues: undefined,
  scenarioSimulationDataSecondCardFiltersValues: undefined,
});

// Create a provider component
export const DataProvider = ({children}: {children: React.ReactNode}) => {
  const [mapData, setMapData] = useState<{id: string; value: number}[] | undefined>(undefined);
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

  const groupFilterParams1: PostFilter[] = useMemo(() => {
    if (selectedDistrict && groupFilterList) {
      return Object.values(groupFilterList)
        .filter((groupFilter) => groupFilter.isVisible)
        .map((groupFilter) => ({
          id: 1,
          node: selectedDistrict,
          groupFilter: groupFilter,
          day: selectedDate ?? '',
        }));
    }
    return [];
  }, [selectedDate, groupFilterList, selectedDistrict]);

  const groupFilterParams2: PostFilter[] = useMemo(() => {
    if (selectedDistrict && groupFilterList) {
      return Object.values(groupFilterList)
        .filter((groupFilter) => groupFilter.isVisible)
        .map((groupFilter) => ({
          id: 2,
          node: selectedDistrict,
          groupFilter: groupFilter,
          day: selectedDate ?? '',
        }));
    }
    return [];
  }, [selectedDate, groupFilterList, selectedDistrict]);

  const startValues = useGetSimulationStartValues();
  const caseScenarioSimulationData = useGetCaseDataByDistrictQuery({
    node: '00000',
    groups: null,
    compartments: null,
  });
  const {data: groupCategories} = useGetGroupCategoriesQuery();
  const {data: groupSubCategories} = useGetGroupSubcategoriesQuery();
  const {data: scenarioListData} = useGetSimulationsQuery();
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

  const {data: scenarioSimulationDataFirstCard} = useGetSingleSimulationEntryQuery(
    {
      id: 1,
      node: selectedDistrict,
      day: selectedDate ?? '',
      groups: ['total'],
    },
    {skip: !selectedDate}
  );

  const {data: scenarioSimulationDataSecondCard} = useGetSingleSimulationEntryQuery(
    {
      id: 2,
      node: selectedDistrict,
      day: selectedDate ?? '',
      groups: ['total'],
    },
    {skip: !selectedDate}
  );

  const {data: scenarioSimulationDataFirstCardFiltersValues} = useGetMultipleGroupFilterDataQuery(groupFilterParams1);
  const {data: scenarioSimulationDataSecondCardFiltersValues} = useGetMultipleGroupFilterDataQuery(groupFilterParams2);

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

  const {data: chartGroupFilterData} = useGetMultipleGroupFilterDataQuery(
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
        mapData: mapData,
        areMapValuesFetching: mapIsCaseDataFetching || mapIsSimulationDataFetching,
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
        scenarioSimulationDataFirstCard,
        scenarioSimulationDataSecondCard,
        scenarioSimulationDataFirstCardFiltersValues: scenarioSimulationDataFirstCardFiltersValues,
        scenarioSimulationDataSecondCardFiltersValues: scenarioSimulationDataSecondCardFiltersValues,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
