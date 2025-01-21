// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {createContext, useState, useEffect, useMemo, useContext} from 'react';
import {useAppDispatch, useAppSelector} from 'store/hooks';
import {
  useGetScenariosQuery,
  useGetScenarioInfectionDataQuery,
  useGetMultiScenarioInfectionDataQuery,
  useGetCompartmentsQuery,
  useGetScenarioQuery,
  useGetModelsQuery,
  useGetGroupsQuery,
  useGetGroupCategoriesQuery,
  useGetModelQuery,
  useGetMultiParameterDefinitionsQuery,
  useGetInterventionTemplatesQuery,
  useGetNodeListsQuery,
  useGetNodesQuery,
} from 'store/services/scenarioApi';
import data from '../assets/lk_germany_reduced.geojson?url';
import {GeoJSON, GeoJsonProperties} from 'geojson';
import {District} from 'types/cologneDistricts';
import searchbarMapData from '../assets/lk_germany_reduced_list.json?url';
import {useTranslation} from 'react-i18next';
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
  ScenarioPreview,
  Scenarios,
} from './store/services/APITypes';
import {
  addScenario,
  removeScenario,
  selectCompartment,
  selectDate,
  selectDistrict,
  selectScenario,
  setMinMaxDates,
  setStartDate,
  updateScenario,
} from './store/DataSelectionSlice';
import theme from './util/Theme';
import {AuthContext} from 'react-oauth2-code-pkce';
import {setToken} from './store/AuthSlice';

// Create the context
export const DataContext = createContext<{
  geoData: GeoJSON | undefined;
  mapData: InfectionData | undefined;
  searchBarData: GeoJsonProperties[] | undefined;
  lineChartData: Record<string, InfectionData> | undefined;
  referenceDateValues: InfectionData | undefined;
  scenarioCardData: Record<string, InfectionData> | undefined;
  groupFilterData: Record<string, InfectionData> | undefined;
  groupCategories: GroupCategories | undefined;
  groups: Groups | undefined;
  scenarios: Scenarios | undefined;
  selectedScenarioData: Scenario | undefined;
  simulationModels: Models | undefined;
  selectedSimulationModel: Model | undefined;
  parameterDefinitions: Record<string, ParameterDefinition> | undefined;
  compartments: Compartments | undefined;
  npis: InterventionTemplates | undefined;
  nodeLists: NodeLists | undefined;
  nodes: Nodes | undefined;
}>({
  geoData: undefined,
  mapData: undefined,
  searchBarData: undefined,
  lineChartData: undefined,
  referenceDateValues: undefined,
  scenarioCardData: undefined,
  groupFilterData: undefined,
  groupCategories: undefined,
  groups: undefined,
  scenarios: undefined,
  selectedScenarioData: undefined,
  simulationModels: undefined,
  selectedSimulationModel: undefined,
  parameterDefinitions: undefined,
  compartments: undefined,
  npis: undefined,
  nodeLists: undefined,
  nodes: undefined,
});

// Create a provider component
export const DataProvider = ({children}: {children: React.ReactNode}) => {
  const {t: defaultT, i18n} = useTranslation();
  const {t: tBackend} = useTranslation('backend');
  const dispatch = useAppDispatch();

  const [geoData, setGeoData] = useState<GeoJSON>();
  const [searchBarData, setSearchBarData] = useState<GeoJsonProperties[] | undefined>(undefined);

  const {token} = useContext(AuthContext);

  useEffect(() => {
    dispatch(setToken(token));
  }, [dispatch, token]);

  const selectedDistrict = useAppSelector((state) => state.dataSelection.district.id);
  const selectedScenario = useAppSelector((state) => state.dataSelection.scenario);
  const scenariosState = useAppSelector((state) => state.dataSelection.scenarios);
  const selectedCompartment = useAppSelector((state) => state.dataSelection.compartment);
  const referenceDate = useAppSelector((state) => state.dataSelection.simulationStart);
  const selectedDate = useAppSelector((state) => state.dataSelection.date);
  const groupFilters = useAppSelector((state) => state.dataSelection.groupFilters);

  const {data: scenarios} = useGetScenariosQuery();
  const {data: compartments} = useGetCompartmentsQuery();
  const {data: npis} = useGetInterventionTemplatesQuery();
  const {data: nodeLists} = useGetNodeListsQuery();
  const {data: nodes} = useGetNodesQuery();
  const {data: groups} = useGetGroupsQuery();
  const {data: groupCategories} = useGetGroupCategoriesQuery();

  const totalGroup = useMemo(() => {
    return groups?.find((group) => group.name === 'Total');
  }, [groups]);

  useEffect(() => {
    if (!selectedDistrict) {
      const germanyNode = nodes?.find((node) => node.name === '00000');
      if (germanyNode) {
        dispatch(selectDistrict({...germanyNode, type: ''}));
      }
    }
  }, [dispatch, nodes, selectedDistrict]);

  useEffect(() => {
    if (scenarios) {
      for (const [id, _] of Object.entries(scenariosState)) {
        if (!scenarios.find((s) => s.id === id)) {
          dispatch(removeScenario(id));
        }
      }

      for (const scenario of scenarios) {
        if (!scenariosState[scenario.id]) {
          dispatch(
            addScenario({
              id: scenario.id,
              state: {
                name: i18n.exists(`scenario-names.${scenario.name}`, {ns: 'backend'})
                  ? tBackend(`scenario-names.${scenario.name}`)
                  : scenario.name,
                description: scenario.description,
                visibility: 'hidden',
                colors: [],
              },
            })
          );
        }
      }
    }
  }, [dispatch, i18n, scenarios, scenariosState, tBackend]);

  const caseDataId = scenarios?.find((scenario) => scenario.name === 'casedata')?.id;
  const {data: caseDataScenario} = useGetScenarioQuery(caseDataId!, {skip: !caseDataId});

  useEffect(() => {
    const node = nodes?.find((node) => node.name === '00000');
    if (node) {
      dispatch(selectDistrict({id: node.id, nuts: node.name, name: '', type: ''}));
    }
  }, [dispatch, nodes]);

  const {data: referenceDateValues} = useGetScenarioInfectionDataQuery(
    {
      path: {
        scenarioId: caseDataScenario?.id,
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
      skip: !caseDataScenario || !referenceDate || !totalGroup,
    }
  );

  const activeScenarios = useMemo(() => {
    return (
      Object.entries(scenariosState)
        .filter(([_, value]) => value.visibility === 'faceUp' || value.visibility === 'faceDown')
        .map(([key]) => key) ?? []
    );
  }, [scenariosState]);

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
      skip: !caseDataScenario || !referenceDate || !totalGroup,
    }
  );

  const {data: groupFilterData} = useGetMultiScenarioInfectionDataQuery(
    {
      pathIds: activeScenarios,
      query: {
        startDate: selectedDate!,
        endDate: selectedDate!,
        nodes: [selectedDistrict],
        percentiles: ['50'],
        groups: Object.values(groupFilters)
          .filter((groupFilter) => groupFilter.isVisible) // Filter visible groups
          .flatMap((groupFilter) => Object.values(groupFilter.groups).flat()), // Extract and flatten group Ids.
      },
    },
    {
      skip:
        activeScenarios.length === 0 || !selectedDate || !selectedDistrict || Object.keys(groupFilters).length === 0,
    }
  );

  const faceUpScenarios = useMemo(() => {
    return (
      Object.entries(scenariosState)
        .filter(([_, value]) => value.visibility === 'faceUp')
        .map(([key]) => key) ?? []
    );
  }, [scenariosState]);

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
      skip: !selectedCompartment || !totalGroup,
    }
  );

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
    {skip: !selectedScenario || !selectedDate || !selectedCompartment || !totalGroup}
  );

  const {data: selectedScenarioData} = useGetScenarioQuery(selectedScenario!, {skip: !selectedScenario});
  const {data: simulationModels} = useGetModelsQuery();
  const {data: selectedSimulationModel} = useGetModelQuery(selectedScenarioData?.modelId ?? '', {
    skip: !selectedScenarioData,
  });
  const {data: parameterDefinitions} = useGetMultiParameterDefinitionsQuery(
    selectedSimulationModel?.parameterDefinitions ?? [],
    {skip: !selectedSimulationModel}
  );

  // Try to set at least one active scenario.
  useEffect(() => {
    if (activeScenarios?.length === 0 && caseDataScenario) {
      dispatch(updateScenario({id: caseDataScenario.id, state: {visibility: 'faceUp'}}));
    }
  }, [activeScenarios, caseDataScenario, dispatch]);

  // If we have no selected scenario, we try to set the case data as selected.
  useEffect(() => {
    if (!selectedScenario && caseDataScenario) {
      dispatch(selectScenario(caseDataScenario.id));
    }
  }, [caseDataScenario, dispatch, selectedScenario]);

  // Set scenario colors
  useEffect(() => {
    if (caseDataScenario) {
      dispatch(updateScenario({id: caseDataScenario.id, state: {colors: theme.custom.scenarios[0]}}));
    }

    scenarios?.forEach((scenario, index) => {
      if (scenario.id !== caseDataScenario?.id) {
        const colorIndex = (index + 1) % theme.custom.scenarios.length; // +1 to avoid using the first predefined color set
        dispatch(updateScenario({id: scenario.id, state: {colors: theme.custom.scenarios[colorIndex]}}));
      }
    });
  }, [caseDataScenario, dispatch, scenarios]);

  // If we have no selected compartment, we try to set the first one as selected.
  useEffect(() => {
    if (!selectedCompartment && compartments && compartments.length > 0) {
      dispatch(selectCompartment(compartments[0].id));
    }
  }, [compartments, dispatch, selectedCompartment]);

  // If we have no reference day, we try to set the last day of case data as reference day.
  useEffect(() => {
    if (!referenceDate && caseDataScenario) {
      dispatch(setStartDate(caseDataScenario.endDate));
    }
  }, [caseDataScenario, dispatch, referenceDate]);

  // Set start and end date.
  useEffect(() => {
    if (activeScenarios && scenarios) {
      const active = activeScenarios
        .map((activeScenario) => scenarios.find((scenario) => scenario.id === activeScenario))
        .filter((scenario) => scenario !== undefined) as Array<ScenarioPreview>;

      const minMax = active.reduce(
        (
          previous: {
            min: string;
            max: string;
          },
          current
        ) => ({
          min: previous.min.localeCompare(current.startDate) < 0 ? previous.min : current.startDate,
          max: previous.max.localeCompare(current.endDate) > 0 ? previous.max : current.endDate,
        }),
        {min: 'XXXX-XX-XX', max: '0000-00-00'}
      );

      if (minMax) {
        dispatch(setMinMaxDates({minDate: minMax.min, maxDate: minMax.max}));
      }
    }
  }, [activeScenarios, dispatch, scenarios]);

  // Try to select a date if none is selected.
  useEffect(() => {
    if (!selectedDate && scenarios && scenarios.length > 0) {
      const lastDay = scenarios.map((scenario) => scenario.endDate).sort((a, b) => b.localeCompare(a))[0];
      dispatch(selectDate(lastDay));
    }
  }, [dispatch, scenarios, selectedDate]);

  // Effect to fetch the geoJSON files for the map displays.
  useEffect(() => {
    void fetch(data, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })
      .then((result) => result.json())
      .then((geodata: GeoJSON) => setGeoData(geodata));
  }, []);

  // This effect fetches the list of available districts (nodes) for the search bar.
  useEffect(() => {
    // get option list from assets
    void fetch(searchbarMapData, {
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
          // append germany to list
          jsonlist.push({RS: '00000', GEN: defaultT('germany'), BEZ: ''} as unknown as District);
          // sort list to put germany at the right place (loading and sorting takes 1.5 ~ 2 sec)
          jsonlist.sort((a: GeoJsonProperties, b: GeoJsonProperties) => {
            return String(a!.GEN).localeCompare(String(b!.GEN));
          });
          // fill countyList state with list
          setSearchBarData(jsonlist);
        }
      );
    // this init should only run once on first render
  }, [defaultT]);

  return (
    <DataContext.Provider
      value={useMemo(
        () => ({
          geoData,
          mapData,
          searchBarData,
          lineChartData,
          referenceDateValues,
          scenarioCardData,
          groupFilterData,
          groupCategories,
          groups,
          scenarios,
          selectedScenarioData,
          simulationModels,
          selectedSimulationModel,
          parameterDefinitions,
          compartments,
          npis,
          nodeLists,
          nodes,
        }),
        [
          geoData,
          mapData,
          searchBarData,
          lineChartData,
          referenceDateValues,
          scenarioCardData,
          groupCategories,
          groups,
          scenarios,
          groupFilterData,
          selectedScenarioData,
          simulationModels,
          selectedSimulationModel,
          parameterDefinitions,
          compartments,
          npis,
          nodeLists,
          nodes,
        ]
      )}
    >
      {children}
    </DataContext.Provider>
  );
};
