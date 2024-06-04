// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {createContext, useState, useEffect, useMemo} from 'react';
import React from 'react';
import {useGetCaseDataByDateQuery} from 'store/services/caseDataApi';
import {useGetMultipleGroupFilterDataQuery} from 'store/services/groupApi';
import {
  SelectedScenarioPercentileData,
  useGetPercentileDataQuery,
  useGetSimulationDataByDateQuery,
} from 'store/services/scenarioApi';
import {SimulationDataByNode} from 'types/scenario';
import {Dictionary} from 'util/util';
import {useGetCaseDataByDistrictQuery} from 'store/services/caseDataApi';
import {useGetMultipleSimulationDataByNodeQuery} from 'store/services/scenarioApi';
import {useAppSelector} from 'store/hooks';

// Create the context
export const DataContext = createContext<{
  mapData: {id: string; value: number}[] | undefined;
  areMapValuesFetching: boolean;
  chartCaseData: {day: string; value: number}[] | undefined;
  chartSimulationData: ({day: string; value: number}[] | null)[] | undefined;
  chartPercentileData: {day: string; value: number}[][] | undefined;
  chartGroupFilterData: Dictionary<{day: string; value: number}[]> | undefined;
  isChartDataFetching: boolean;
}>({
  mapData: undefined,
  areMapValuesFetching: false,
  chartCaseData: undefined,
  chartSimulationData: undefined,
  chartPercentileData: undefined,
  chartGroupFilterData: undefined,
  isChartDataFetching: false,
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

  const selectedDistrict = useAppSelector((state) => state.dataSelection.district.ags);
  const selectedScenario = useAppSelector((state) => state.dataSelection.scenario);
  const activeScenarios = useAppSelector((state) => state.dataSelection.activeScenarios);
  const selectedCompartment = useAppSelector((state) => state.dataSelection.compartment);
  const selectedDate = useAppSelector((state) => state.dataSelection.date);
  const groupFilterList = useAppSelector((state) => state.dataSelection.groupFilters);
  const scenarioList = useAppSelector((state) => state.scenarioList);

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

  const value = useMemo(
    () => ({
      mapData: mapData,
      areMapValuesFetching: mapIsCaseDataFetching || mapIsSimulationDataFetching,
      chartCaseData: processedChartCaseData,
      chartSimulationData: processedChartSimulationData,
      chartPercentileData: processedChartPercentileData,
      chartGroupFilterData: processedChartGroupFilterData,
      isChartDataFetching: chartCaseDataFetching || chartSimulationFetching,
    }),
    [
      mapData,
      mapIsCaseDataFetching,
      mapIsSimulationDataFetching,
      processedChartCaseData,
      processedChartSimulationData,
      processedChartPercentileData,
      processedChartGroupFilterData,
      chartCaseDataFetching,
      chartSimulationFetching,
    ]
  );
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
