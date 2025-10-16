// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {createContext, useContext, useEffect, useMemo} from 'react';
import {BaseData} from 'context/BaseDataContext';
import {useAppDispatch, useAppSelector} from 'store/hooks';
import {
  useGetModelQuery,
  useGetMultiParameterDefinitionsQuery,
  useGetMultiScenarioInfectionDataQuery,
  useGetMultiScenariosQuery,
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
import {AggregationWindow, ScenarioVisibility} from 'store/DataSelectionSlice';

interface DataContextType {
  geoData: GeoJSON;
  mapData: InfectionData;
  searchBarData: GeoJsonProperties[];
  lineChartData: Record<string, InfectionData>;
  referenceDateValues: InfectionData;
  scenarioCardData: Record<string, InfectionData>;
  scenarioCardMetaData: Record<string, Scenario>;
  groupFilterCardData: Record<string, InfectionData>;
  groupFilterLineChartData: InfectionData;
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
  const relativeNumbers = useAppSelector((state) => state.dataSelection.relativeNumbers);
  const aggregationWindow = useAppSelector((state) => state.dataSelection.aggregationWindow);

  const {token} = useContext(AuthContext);

  // Helper to subtract days from an ISO date string (YYYY-MM-DD)
  function subtractDays(isoDate: string, days: number): string {
    const d = new Date(isoDate);
    d.setUTCDate(d.getUTCDate() - days);
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  const aggregationOffset = useMemo(() => {
    if (aggregationWindow === AggregationWindow.OneDay) return 1;
    if (aggregationWindow === AggregationWindow.SevenDays) return 7;
    return 0;
  }, [aggregationWindow]);

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
        startDate: referenceDate
          ? aggregationOffset > 0
            ? subtractDays(referenceDate, aggregationOffset)
            : referenceDate
          : undefined,
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
        startDate:
          selectedDate && aggregationOffset > 0 ? subtractDays(selectedDate, aggregationOffset) : selectedDate!,
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

  const {data: scenarioCardMetaData} = useGetMultiScenariosQuery(activeScenarios, {skip: activeScenarios.length === 0});

  // Fetch group filter data
  const visibleGroups = useMemo(() => {
    return Object.values(groupFilters)
      .filter((groupFilter) => groupFilter.isVisible)
      .flatMap((groupFilter) => Object.values(groupFilter.groups).flat());
  }, [groupFilters]);

  const {data: groupFilterCardData} = useGetMultiScenarioInfectionDataQuery(
    {
      pathIds: activeScenarios,
      query: {
        startDate:
          selectedDate && aggregationOffset > 0 ? subtractDays(selectedDate, aggregationOffset) : selectedDate!,
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

  const {data: groupFilterLineChartData} = useGetScenarioInfectionDataQuery(
    {
      path: {scenarioId: selectedScenario!},
      query: {
        compartments: [selectedCompartment!],
        nodes: [selectedDistrict],
        percentiles: ['50'],
        groups: visibleGroups,
      },
    },
    {
      skip: !selectedScenario || visibleGroups.length === 0 || !selectedCompartment || !selectedDistrict,
    }
  );

  const faceUpScenarios = useMemo(
    () => Object.keys(scenariosState).filter((id) => scenariosState[id].visibility === ScenarioVisibility.FaceUp),
    [scenariosState]
  );

  // Fetch line chart data
  const {currentData: lineChartData} = useGetMultiScenarioInfectionDataQuery(
    {
      pathIds: faceUpScenarios,
      query: {
        nodes: [selectedDistrict],
        compartments: [selectedCompartment!],
        groups: totalGroup ? [totalGroup.id] : [],
      },
    },
    {
      skip: !totalGroup,
    }
  );

  // Fetch map data
  const {currentData: mapData} = useGetScenarioInfectionDataQuery(
    {
      path: {scenarioId: selectedScenario!},
      query: {
        startDate:
          selectedDate && aggregationOffset > 0 ? subtractDays(selectedDate, aggregationOffset) : selectedDate!,
        endDate: selectedDate!,
        compartments: [selectedCompartment!],
        groups: totalGroup ? [totalGroup.id] : [],
      },
    },
    {skip: !totalGroup || !selectedScenario}
  );

  const nodeIdToNuts = useMemo(() => {
    const map: Record<string, string> = {};
    (props.baseData.nodes ?? []).forEach((n) => {
      if (n?.id && n?.nuts) map[n.id] = n.nuts;
    });
    return map;
  }, [props.baseData.nodes]);

  // Derive windowed series (Total/1d/7d-sum) per node/group/compartment/percentile
  const deriveWindowedSeries = useMemo(() => {
    return (infectionData: InfectionData, aggregation: AggregationWindow | null): InfectionData => {
      if (!infectionData || !Array.isArray(infectionData) || aggregation === null) return infectionData ?? [];
      // Base series assumed to be daily-new values:
      // - Total: pass-through
      // - 1d:    pass-through
      // - 7d:    rolling sum over last 7 days (t-6..t)
      if (aggregation === AggregationWindow.Total || aggregation === AggregationWindow.OneDay)
        return infectionData ?? [];

      const keyToEntries = new Map<string, InfectionData>();
      const buildGroupingKey = (entry: (typeof infectionData)[number]) =>
        `${entry.node ?? ''}|${entry.group ?? ''}|${entry.compartment ?? ''}|${entry.aggregation ?? ''}|${entry.percentile}`;

      for (const entry of infectionData) {
        const key = buildGroupingKey(entry);
        if (!keyToEntries.has(key)) keyToEntries.set(key, []);
        keyToEntries.get(key)!.push(entry);
      }

      const derivedSeries: InfectionData = [];
      for (const groupedEntries of keyToEntries.values()) {
        const entriesSortedByDate = [...groupedEntries].sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''));
        // Rolling 7d sum: require at least 7 points (index >= 6)
        for (let i = 0; i < entriesSortedByDate.length; i++) {
          if (i < 6) continue;
          let rollingSum = 0;
          for (let windowIndex = i - 6; windowIndex <= i; windowIndex++) {
            rollingSum += entriesSortedByDate[windowIndex].value;
          }
          const currentEntry = entriesSortedByDate[i];
          derivedSeries.push({...currentEntry, value: rollingSum});
        }
      }

      return derivedSeries;
    };
  }, []);

  // Transform utility: apply window derivation (optionally) then relative normalization
  const transformInfectionData = useMemo(() => {
    return (infectionData: InfectionData | undefined): InfectionData => {
      if (!infectionData) return [];
      console.log('transformInfectionData', infectionData, aggregationWindow);

      const derivedSeries = deriveWindowedSeries(infectionData, aggregationWindow);

      if (!relativeNumbers) return derivedSeries ?? [];
      console.log('transformInfectionData window', derivedSeries);

      return derivedSeries.map((entry) => {
        const nutsCode = entry.node ? nodeIdToNuts[entry.node] : undefined;
        const population = nutsCode ? props.baseData.populationByNuts[nutsCode] : undefined;
        const isValidPopulation = typeof population === 'number' && isFinite(population) && population > 0;
        const normalizedValue = isValidPopulation ? (entry.value / population) * 100000 : entry.value;
        return {...entry, value: normalizedValue};
      });
    };
  }, [aggregationWindow, deriveWindowedSeries, nodeIdToNuts, props.baseData.populationByNuts, relativeNumbers]);

  const transformMultiInfectionData = useMemo(() => {
    return (multi: Record<string, InfectionData> | undefined): Record<string, InfectionData> => {
      if (!multi) return {};
      const result: Record<string, InfectionData> = {};
      Object.entries(multi).forEach(([k, v]) => {
        result[k] = transformInfectionData(v);
      });
      return result;
    };
  }, [transformInfectionData]);

  const contextValue: DataContextType = useMemo(
    () => ({
      ...props.baseData,
      mapData: transformInfectionData(mapData) ?? [],
      lineChartData: transformMultiInfectionData(lineChartData) ?? {},
      referenceDateValues: transformInfectionData(referenceDateValues) ?? [],
      scenarioCardData: transformMultiInfectionData(scenarioCardData) ?? {},
      scenarioCardMetaData: scenarioCardMetaData ?? {},
      groupFilterCardData: transformMultiInfectionData(groupFilterCardData) ?? {},
      groupFilterLineChartData: transformInfectionData(groupFilterLineChartData) ?? [],
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
      scenarioCardMetaData,
      groupFilterCardData,
      groupFilterLineChartData,
      selectedScenarioData,
      selectedSimulationModel,
      parameterDefinitions,
      transformInfectionData,
      transformMultiInfectionData,
    ]
  );

  return <DataContext.Provider value={contextValue}>{props.children}</DataContext.Provider>;
}
