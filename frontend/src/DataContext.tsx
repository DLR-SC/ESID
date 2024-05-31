import {createContext, useState, useEffect} from 'react';
import React from 'react';
import {useGetCaseDataByDateQuery} from 'store/services/caseDataApi';
import {useGetMultipleGroupFilterDataQuery} from 'store/services/groupApi';
import {
  SelectedScenarioPercentileData,
  useGetPercentileDataQuery,
  useGetSimulationDataByDateQuery,
} from 'store/services/scenarioApi';
import {CaseDataByNode} from 'types/caseData';
import {GroupResponse} from 'types/group';
import {SimulationDataByNode} from 'types/scenario';
import {Dictionary} from 'util/util';
import {useGetCaseDataByDistrictQuery} from 'store/services/caseDataApi';
import {useGetMultipleSimulationDataByNodeQuery} from 'store/services/scenarioApi';
import {useAppSelector} from 'store/hooks';

// Create the context
export const DataContext = createContext<{
  mapData: {id: string; value: number}[] | undefined;
  areMapValuesFetching: boolean;
  caseData: CaseDataByNode | undefined;
  simulationData: SimulationDataByNode[] | undefined;
  percentileData: SelectedScenarioPercentileData[] | undefined;
  groupFilterData: Dictionary<GroupResponse> | undefined;
  isChartDataFetching: boolean;
}>({
  mapData: undefined,
  areMapValuesFetching: false,
  caseData: undefined,
  simulationData: undefined,
  percentileData: undefined,
  groupFilterData: undefined,
  isChartDataFetching: false,
});

// Create a provider component
export const DataProvider = ({children}: {children: React.ReactNode}) => {
  const [mapData, setMapData] = useState<{id: string; value: number}[] | undefined>(undefined);

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

  const {data: percentileData} = useGetPercentileDataQuery(
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
      : [],
    {skip: !selectedDistrict || selectedDistrict === undefined || Object.keys(selectedDistrict).length == 0}
  );

  useEffect(() => {
    if (mapSimulationData && selectedCompartment) {
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
  }, [mapSimulationData, selectedCompartment, mapCaseData]);

  return (
    <DataContext.Provider
      value={{
        mapData: mapData,
        areMapValuesFetching: mapIsCaseDataFetching || mapIsSimulationDataFetching,
        caseData: chartCaseData,
        simulationData: chartSimulationData,
        percentileData: percentileData,
        groupFilterData: groupFilterData,
        isChartDataFetching: chartCaseDataFetching || chartSimulationFetching,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
