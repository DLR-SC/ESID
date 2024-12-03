// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {createContext, useState, useEffect, useMemo} from 'react';
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
  Models,
  Scenarios,
} from './store/services/APITypes';
import {
  selectCompartment,
  selectDate,
  selectScenario,
  setActiveScenario,
  setStartDate,
} from './store/DataSelectionSlice';

// Create the context
export const DataContext = createContext<{
  geoData: GeoJSON | undefined;
  mapData: InfectionData | undefined;
  searchBarData: GeoJsonProperties[] | undefined;
  lineChartData: Record<string, InfectionData> | undefined;
  referenceDateValues: InfectionData | undefined;
  scenarioCardData: Record<string, InfectionData> | undefined;
  groupCategories: GroupCategories | undefined;
  groups: Groups | undefined;
  scenarios: Scenarios | undefined;
  simulationModels: Models | undefined;
  compartments: Compartments | undefined;
}>({
  geoData: undefined,
  mapData: undefined,
  searchBarData: undefined,
  lineChartData: undefined,
  referenceDateValues: undefined,
  scenarioCardData: undefined,
  groupCategories: undefined,
  groups: undefined,
  scenarios: undefined,
  simulationModels: undefined,
  compartments: undefined,
});

// Create a provider component
export const DataProvider = ({children}: {children: React.ReactNode}) => {
  const {t: defaultT} = useTranslation();
  const dispatch = useAppDispatch();

  const [geoData, setGeoData] = useState<GeoJSON>();
  const [searchBarData, setSearchBarData] = useState<GeoJsonProperties[] | undefined>(undefined);

  const selectedDistrict = useAppSelector((state) => state.dataSelection.district.ags);
  const selectedScenario = useAppSelector((state) => state.dataSelection.scenario);
  const activeScenarios = useAppSelector((state) => state.dataSelection.activeScenarios);
  const selectedCompartment = useAppSelector((state) => state.dataSelection.compartment);
  const referenceDate = useAppSelector((state) => state.dataSelection.simulationStart);
  const selectedDate = useAppSelector((state) => state.dataSelection.date);

  const {data: scenarios} = useGetScenariosQuery();
  const {data: compartments} = useGetCompartmentsQuery();

  const caseDataId = scenarios?.find((scenario) => scenario.name === 'caseData')?.id;
  const {data: caseDataScenario} = useGetScenarioQuery(caseDataId!, {skip: !caseDataId});

  const {data: referenceDateValues} = useGetScenarioInfectionDataQuery(
    {
      path: {
        scenarioId: caseDataScenario!.id,
      },
      query: {
        startDate: referenceDate!,
        endDate: referenceDate!,
        nodes: [selectedDistrict],
        percentiles: ['50'],
      },
    } as InfectionDataParameters,
    {
      skip: !caseDataScenario || !referenceDate,
    }
  );

  const {data: scenarioCardData} = useGetMultiScenarioInfectionDataQuery(
    {
      pathIds: activeScenarios ?? [],
      query: {
        startDate: selectedDate!,
        endDate: selectedDate!,
        nodes: [selectedDistrict],
        percentiles: ['50'],
      },
    },
    {
      skip: !caseDataScenario || !referenceDate,
    }
  );

  const {data: lineChartData} = useGetMultiScenarioInfectionDataQuery(
    {
      pathIds: activeScenarios ?? [],
      query: {
        nodes: [selectedDistrict],
        compartments: [selectedCompartment!],
      },
    },
    {
      skip: !selectedCompartment,
    }
  );

  const {data: mapData} = useGetScenarioInfectionDataQuery({
    path: {scenarioId: selectedScenario!},
    query: {
      startDate: selectedDate!,
      endDate: selectedDate!,
      percentiles: ['50'],
      compartments: [selectedCompartment!],
    },
  });

  const {data: simulationModels} = useGetModelsQuery();
  const {data: groups} = useGetGroupsQuery();
  const {data: groupCategories} = useGetGroupCategoriesQuery();

  // Try to set at least one active scenario.
  useEffect(() => {
    if (activeScenarios?.length === 0 && caseDataScenario) {
      dispatch(setActiveScenario([caseDataScenario.id]));
    }
  }, [activeScenarios, caseDataScenario, dispatch]);

  // If we have no selected scenario, we try to set the case data as selected.
  useEffect(() => {
    if (!selectedScenario && caseDataScenario) {
      dispatch(selectScenario(caseDataScenario.id));
    }
  }, [caseDataScenario, dispatch, selectedScenario]);

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
  });

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
          groupCategories,
          groups,
          scenarios,
          simulationModels,
          compartments,
        }),
        [
          geoData,
          groupCategories,
          groups,
          lineChartData,
          mapData,
          referenceDateValues,
          scenarioCardData,
          scenarios,
          searchBarData,
          simulationModels,
          compartments,
        ]
      )}
    >
      {children}
    </DataContext.Provider>
  );
};
