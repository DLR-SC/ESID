// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {ReactNode, useEffect, useMemo, useState} from 'react';
import {
  useGetCompartmentsQuery,
  useGetGroupCategoriesQuery,
  useGetGroupsQuery,
  useGetInterventionTemplatesQuery,
  useGetModelsQuery,
  useGetNodeListsQuery,
  useGetNodesQuery,
  useGetScenariosQuery,
} from 'store/services/scenarioApi';
import {
  Compartments,
  GroupCategories,
  Groups,
  InterventionTemplates,
  Models,
  NodeLists,
  Nodes,
  Scenarios,
} from 'store/services/APITypes';
import CircularProgress from '@mui/material/CircularProgress';
import ValidateState from 'context/ValidateState';
import {GeoJSON, GeoJsonProperties} from 'geojson';
import {useTranslation} from 'react-i18next';

export interface BaseData {
  scenarios: Scenarios;
  compartments: Compartments;
  npis: InterventionTemplates;
  nodeLists: NodeLists;
  nodes: Nodes;
  groups: Groups;
  groupCategories: GroupCategories;
  simulationModels: Models;
  geoData: GeoJSON;
  searchBarData: GeoJsonProperties[];
  populationByNuts: Record<string, number>;
}

/**
 * BaseDataContext is a component that manages the loading and preparation of base data that has no direct dependencies.
 * It fetches data from several sources and passes it to a validator, once all data is loaded.
 */
export default function BaseDataContext(props: {children: ReactNode}): JSX.Element {
  const {data: scenarios, ...scenariosResult} = useGetScenariosQuery();
  const {data: compartments, ...compartmentsResult} = useGetCompartmentsQuery();
  const {data: npis, ...npisResult} = useGetInterventionTemplatesQuery();
  const {data: nodeLists, ...nodeListsResult} = useGetNodeListsQuery();
  const {data: nodes, ...nodesResult} = useGetNodesQuery();
  const {data: groups, ...groupsResult} = useGetGroupsQuery();
  const {data: groupCategories, ...groupCategoriesResult} = useGetGroupCategoriesQuery();
  const {data: simulationModels, ...simulationModelsResult} = useGetModelsQuery();

  const geoData = useGeoData();
  const searchBarData = useSearchBarData();
  const populationByNuts = usePopulationData();

  const dataLoadingCompleted = useMemo(() => {
    return (
      !scenariosResult.isLoading &&
      !compartmentsResult.isLoading &&
      !npisResult.isLoading &&
      !nodeListsResult.isLoading &&
      !nodesResult.isLoading &&
      !groupsResult.isLoading &&
      !groupCategoriesResult.isLoading &&
      !simulationModelsResult.isLoading &&
      geoData &&
      searchBarData &&
      populationByNuts
    );
  }, [
    compartmentsResult.isLoading,
    geoData,
    groupCategoriesResult.isLoading,
    groupsResult.isLoading,
    nodeListsResult.isLoading,
    nodesResult.isLoading,
    npisResult.isLoading,
    scenariosResult.isLoading,
    searchBarData,
    simulationModelsResult.isLoading,
    populationByNuts,
  ]);

  const baseData: BaseData = useMemo(
    () => ({
      scenarios: scenarios ?? [],
      compartments: compartments ?? [],
      npis: npis ?? [],
      nodeLists: nodeLists ?? [],
      nodes: nodes ?? [],
      groups: groups ?? [],
      groupCategories: groupCategories ?? [],
      simulationModels: simulationModels ?? [],
      geoData: geoData ?? {type: 'FeatureCollection', features: []},
      searchBarData: searchBarData ?? [],
      populationByNuts: populationByNuts ?? {},
    }),
    [
      scenarios,
      compartments,
      npis,
      nodeLists,
      nodes,
      groups,
      groupCategories,
      simulationModels,
      geoData,
      searchBarData,
      populationByNuts,
    ]
  );

  if (dataLoadingCompleted) {
    return <ValidateState baseData={baseData}>{props.children}</ValidateState>;
  }

  return <CircularProgress variant='indeterminate' />;
}

import geoMapData from '../../assets/lk_germany_reduced.geojson?url';

function useGeoData() {
  const [geoData, setGeoData] = useState<GeoJSON>();

  useEffect(() => {
    void fetch(geoMapData, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })
      .then((result) => result.json())
      .then((geodata: GeoJSON) => setGeoData(geodata));
  }, []);

  return geoData;
}

import searchbarMapData from '../../assets/lk_germany_reduced_list.json?url';

function useSearchBarData() {
  const {t} = useTranslation();
  const [searchBarData, setSearchBarData] = useState<GeoJsonProperties[]>();

  useEffect(() => {
    void fetch(searchbarMapData, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })
      .then((response) => response.json())
      .then((jsonlist: GeoJsonProperties[]) => {
        jsonlist.push({RS: '00000', GEN: t('germany'), BEZ: ''} as unknown as GeoJsonProperties);
        jsonlist.sort((a: GeoJsonProperties, b: GeoJsonProperties) => {
          return String(a!.GEN).localeCompare(String(b!.GEN));
        });
        setSearchBarData(jsonlist);
      });
  }, [t]);

  return searchBarData;
}

import populationDataUrl from '../../assets/population_data_v3.json?url';

interface PopulationData {
  id: string;
  name: string;
  total_population: number | string;
}

function usePopulationData() {
  const [populationByNuts, setPopulationByNuts] = useState<Record<string, number>>();

  useEffect(() => {
    void fetch(populationDataUrl, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })
      .then((response) => response.json())
      .then((jsonlist: PopulationData[]) => {
        const map: Record<string, number> = {};
        jsonlist.forEach((entry) => {
          const id = String(entry?.id || '').trim();
          const pop = typeof entry?.total_population === 'number' ? entry.total_population : undefined;
          if (id && typeof pop === 'number' && isFinite(pop) && pop > 0) {
            map[id] = pop;
          }
        });
        setPopulationByNuts(map);
      });
  }, []);

  return populationByNuts;
}
