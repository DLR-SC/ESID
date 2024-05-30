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

  const selectedScenario = 1;
  const activeScenarios = [0, 1, 2];
  const selectedCompartment = 'Infected';
  const selectedDate = '2021-09-04';
  const selectedDistrict = {RS: '11000', GEN: 'Berlin', BEZ: 'Berlin'};
  const groupFilterList = {
    '3ce4e1be-1a8c-42a4-841d-8e93e2ab0d87': {
      id: '3ce4e1be-1a8c-42a4-841d-8e93e2ab0d87',
      name: 'aaaaa',
      isVisible: true,
      groups: {
        age: ['age_0', 'age_1', 'age_2'],
        gender: ['male', 'nonbinary', 'female'],
      },
    },
    'f9b26583-78df-440f-b35d-bf22b5c3a439': {
      id: 'f9b26583-78df-440f-b35d-bf22b5c3a439',
      name: 'lllllllllllllll',
      isVisible: true,
      groups: {
        age: ['age_0', 'age_1', 'age_3', 'age_2', 'age_4'],
        gender: ['female', 'male', 'nonbinary'],
      },
    },
  };
  const scenarioList = {
    scenarios: {
      '1': {
        id: 1,
        label: 'Summer 2021 Simulation 1',
      },
      '2': {
        id: 2,
        label: 'Summer 2021 Simulation 2',
      },
    },
    compartments: [
      'Infected',
      'Hospitalized',
      'ICU',
      'Dead',
      'Exposed',
      'Recovered',
      'Carrier',
      'Susceptible',
      'CarrierT',
      'CarrierTV1',
      'CarrierTV2',
      'CarrierV1',
      'CarrierV2',
      'ExposedV1',
      'ExposedV2',
      'HospitalizedV1',
      'HospitalizedV2',
      'ICUV1',
      'ICUV2',
      'InfectedT',
      'InfectedTV1',
      'InfectedTV2',
      'InfectedV1',
      'InfectedV2',
      'SusceptibleV1',
    ],
  };

  // useEffect(() => {
  //   const fetchMapValues = async () => {
  //     try {
  //       setAreMapValuesFetching(true);
  //       const response = await fetch(
  //         'http://hpcagainstcorona.sc.bs.dlr.de:8000/api/v1/simulation/2/2021-09-04/?all&groups=total&compartments=Infected'
  //       );
  //       const result = (await response.json()) as {
  //         results: Array<{name: string; day: string; compartments: {Infected: number}}>;
  //       };
  //       console.log(result);
  //       let data: Array<{id: string; value: number}> = [];
  //       result.results.forEach((element: {name: string; day: string; compartments: {Infected: number}}) => {
  //         data.push({id: element.name, value: element.compartments.Infected});
  //       });
  //       data = data.filter((element) => {
  //         return element.id != '00000';
  //       });
  //       setMapData(data);
  //       setAreMapValuesFetching(false);
  //     } catch (error) {
  //       console.error('Error fetching data:', error);
  //     }
  //   };
  //   fetchMapValues();
  // }, []);

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
              (scenarioList.scenarios[s.toString() as keyof typeof scenarioList.scenarios] as {
                id: number;
                label: string;
              })
            );
          })
        : [],
      node: selectedDistrict.RS,
      groups: ['total'],
      compartments: [selectedCompartment ?? ''],
    },
    {skip: !selectedCompartment}
  );

  const {data: chartCaseData, isFetching: chartCaseDataFetching} = useGetCaseDataByDistrictQuery(
    {
      node: selectedDistrict.RS,
      groups: ['total'],
      compartments: [selectedCompartment ?? ''],
    },
    {skip: !selectedCompartment}
  );

  const {data: percentileData} = useGetPercentileDataQuery(
    {
      id: selectedScenario as number,
      node: selectedDistrict.RS,
      groups: ['total'],
      compartment: selectedCompartment as string,
    },
    {skip: selectedScenario === null || selectedScenario === 0 || !selectedCompartment}
  );

  const {data: groupFilterData} = useGetMultipleGroupFilterDataQuery(
    groupFilterList && selectedScenario && selectedDistrict && selectedCompartment
      ? Object.values(groupFilterList)
          .filter((groupFilter) => groupFilter.isVisible)
          .map((groupFilter) => {
            return {
              id: selectedScenario,
              node: selectedDistrict.RS,
              compartment: selectedCompartment,
              groupFilter: groupFilter,
            };
          })
      : []
  );

  useEffect(() => {
    if (mapSimulationData) {
      setMapData(
        mapSimulationData.results
          .filter((element: {name: string}) => {
            return element.name != '00000';
          })
          .map((element: {name: string; compartments: {[key: string]: number}}) => {
            return {id: element.name, value: element.compartments[selectedCompartment]} as {id: string; value: number};
          })
      );
    } else if (mapCaseData) {
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
