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

  // Derive windowed series (total/new1d/new7d) per node/group/compartment/percentile
  const deriveWindowedSeries = useMemo(() => {
    return (data: InfectionData, window: AggregationWindow | null): InfectionData => {
      if (!data || !Array.isArray(data) || window === null || window === AggregationWindow.Total) {
        console.log('deriveWindowedSeries', data, window);
        return data ?? [];
      }

      const groups = new Map<string, InfectionData>();
      const makeKey = (e: (typeof data)[number]) =>
        `${e.node ?? ''}|${e.group ?? ''}|${e.compartment ?? ''}|${e.aggregation ?? ''}|${e.percentile}`;

      for (const e of data) {
        const k = makeKey(e);
        if (!groups.has(k)) groups.set(k, []);
        groups.get(k)!.push(e);
      }

      const out: InfectionData = [];
      for (const entries of groups.values()) {
        const sorted = [...entries].sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''));
        const offset = window === AggregationWindow.OneDay ? 1 : 7;
        for (let i = 0; i < sorted.length; i++) {
          const curr = sorted[i];
          const j = i - offset;

          // skip if previous date < start of data
          if (j < 0) continue;
          const prev = sorted[j];
          const diff = curr.value - prev.value;
          out.push({...curr, value: diff});
        }
      }

      return out;
    };
  }, []);

  // Transform utility: apply window derivation (optionally) then relative normalization
  const transformInfectionData = useMemo(() => {
    return (data: InfectionData | undefined): InfectionData => {
      if (!data) return [];
      console.log('transformInfectionData', data, aggregationWindow);

      const windowed = deriveWindowedSeries(data, aggregationWindow);

      if (!relativeNumbers) return windowed ?? [];
      console.log('transformInfectionData window', windowed);

      return windowed.map((entry) => {
        const nuts = entry.node ? nodeIdToNuts[entry.node] : undefined;
        const pop = nuts ? props.baseData.populationByNuts[nuts] : undefined;
        const validPop = typeof pop === 'number' && isFinite(pop) && pop > 0 ? pop : undefined;
        const value = validPop ? (entry.value / validPop) * 100000 : entry.value;
        return {...entry, value};
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
