// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {createContext, useContext, useEffect, useMemo} from 'react';
import {BaseData} from 'context/BaseDataContext';
import {useAppDispatch, useAppSelector} from 'store/hooks';
import {
  useGetModelQuery,
  useGetMultiParameterDefinitionsQuery,
  useGetMultiScenarioInfectionDataQuery,
  useGetScenarioInfectionDataQuery,
  useGetScenarioQuery,
} from 'store/services/scenarioApi';
import {
  Compartments,
  GroupCategories,
  Groups,
  InfectionData,
  InfectionDataParameters,
  InterventionTemplates,
  Model,
  Models,
  NodeLists,
  Nodes,
  ParameterDefinition,
  Scenario,
  Scenarios,
} from 'store/services/APITypes';
import {GeoJSON, GeoJsonProperties} from 'geojson';
import {AuthContext} from 'react-oauth2-code-pkce';
import {setToken} from 'store/AuthSlice';
import {ScenarioVisibility} from 'store/DataSelectionSlice';

interface DataContextType {
  geoData: GeoJSON;
  mapData: InfectionData;
  searchBarData: GeoJsonProperties[];
  lineChartData: Record<string, InfectionData>;
  referenceDateValues: InfectionData;
  scenarioCardData: Record<string, InfectionData>;
  groupFilterData: Record<string, InfectionData>;
  groupCategories: GroupCategories;
  groups: Groups;
  scenarios: Scenarios;
  selectedScenarioData: Scenario;
  simulationModels: Models;
  selectedSimulationModel: Model;
  parameterDefinitions: Record<string, ParameterDefinition>;
  compartments: Compartments;
  npis: InterventionTemplates;
  nodeLists: NodeLists;
  nodes: Nodes;
}

export const DataContext = createContext<DataContextType | null>(null);

export default function SelectedDataContext(props: {baseData: BaseData; children: React.ReactNode}) {
  const dispatch = useAppDispatch();

  const selectedDistrict = useAppSelector((state) => state.dataSelection.district.id);
  const scenariosState = useAppSelector((state) => state.dataSelection.scenarios);
  const selectedScenario = useAppSelector((state) => state.dataSelection.scenario);
  const selectedCompartment = useAppSelector((state) => state.dataSelection.compartment);
  const selectedDate = useAppSelector((state) => state.dataSelection.date);
  const referenceDate = useAppSelector((state) => state.dataSelection.simulationStart);
  const groupFilters = useAppSelector((state) => state.dataSelection.groupFilters);

  const {token} = useContext(AuthContext);

  useEffect(() => {
    dispatch(setToken(token));
  }, [dispatch, token]);

  // 1. Get the total group.
  const totalGroup = useMemo(
    () => props.baseData.groups.find((group) => group.name === 'Total'),
    [props.baseData.groups]
  );

  const caseData = useMemo(
    () => props.baseData.scenarios.find((scenario) => scenario.name === 'casedata')?.id,
    [props.baseData.scenarios]
  );

  // Fetch reference date values
  const {data: referenceDateValues} = useGetScenarioInfectionDataQuery(
    {
      path: {
        scenarioId: caseData || '',
      },
      query: {
        startDate: referenceDate!,
        endDate: referenceDate!,
        nodes: [selectedDistrict],
        percentiles: ['50'],
        groups: totalGroup ? [totalGroup.id] : [],
      },
    } as InfectionDataParameters,
    {
      skip: !totalGroup || !caseData,
    }
  );

  // Get selected scenario data and model
  const {data: selectedScenarioData} = useGetScenarioQuery(selectedScenario || '', {skip: !selectedScenario});

  const {data: selectedSimulationModel} = useGetModelQuery(selectedScenarioData?.modelId || '', {
    skip: !selectedScenarioData,
  });
  const {data: parameterDefinitions} = useGetMultiParameterDefinitionsQuery(
    selectedSimulationModel?.parameterDefinitions || [],
    {skip: !selectedSimulationModel}
  );

  const activeScenarios = useMemo(
    () =>
      Object.keys(scenariosState).filter(
        (id) =>
          scenariosState[id].visibility === ScenarioVisibility.FaceUp ||
          scenariosState[id].visibility === ScenarioVisibility.FaceDown
      ),
    [scenariosState]
  );

  // Fetch scenario card data
  const {data: scenarioCardData} = useGetMultiScenarioInfectionDataQuery(
    {
      pathIds: activeScenarios,
      query: {
        startDate: selectedDate!,
        endDate: selectedDate!,
        nodes: [selectedDistrict],
        percentiles: ['50'],
        groups: totalGroup ? [totalGroup.id] : [],
      },
    },
    {
      skip: !totalGroup || activeScenarios.length === 0,
    }
  );

  // Fetch group filter data
  const visibleGroups = useMemo(() => {
    return Object.values(groupFilters)
      .filter((groupFilter) => groupFilter.isVisible)
      .flatMap((groupFilter) => Object.values(groupFilter.groups).flat());
  }, [groupFilters]);

  const {data: groupFilterData} = useGetMultiScenarioInfectionDataQuery(
    {
      pathIds: activeScenarios,
      query: {
        startDate: selectedDate!,
        endDate: selectedDate!,
        nodes: [selectedDistrict],
        percentiles: ['50'],
        groups: visibleGroups,
      },
    },
    {
      skip: activeScenarios.length === 0 || visibleGroups.length === 0,
    }
  );

  const faceUpScenarios = useMemo(
    () => Object.keys(scenariosState).filter((id) => scenariosState[id].visibility === ScenarioVisibility.FaceUp),
    [scenariosState]
  );

  // Fetch line chart data
  const {data: lineChartData} = useGetMultiScenarioInfectionDataQuery(
    {
      pathIds: faceUpScenarios,
      query: {
        nodes: [selectedDistrict],
        compartments: [selectedCompartment!],
        groups: totalGroup ? [totalGroup.id] : [],
      },
    },
    {
      skip: !totalGroup || faceUpScenarios.length === 0,
    }
  );

  // Fetch map data
  const {data: mapData} = useGetScenarioInfectionDataQuery(
    {
      path: {scenarioId: selectedScenario!},
      query: {
        startDate: selectedDate!,
        endDate: selectedDate!,
        compartments: [selectedCompartment!],
        groups: totalGroup ? [totalGroup.id] : [],
      },
    },
    {skip: !totalGroup}
  );

  const contextValue: DataContextType = useMemo(
    () => ({
      ...props.baseData,
      mapData: mapData ?? [],
      lineChartData: lineChartData ?? {},
      referenceDateValues: referenceDateValues ?? [],
      scenarioCardData: scenarioCardData ?? {},
      groupFilterData: groupFilterData ?? {},
      selectedScenarioData: selectedScenarioData!,
      selectedSimulationModel: selectedSimulationModel!,
      parameterDefinitions: parameterDefinitions ?? {},
    }),
    [
      props.baseData,
      mapData,
      lineChartData,
      referenceDateValues,
      scenarioCardData,
      groupFilterData,
      selectedScenarioData,
      selectedSimulationModel,
      parameterDefinitions,
    ]
  );

  return <DataContext.Provider value={contextValue}>{props.children}</DataContext.Provider>;
}
