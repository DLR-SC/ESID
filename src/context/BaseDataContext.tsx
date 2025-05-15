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
}

export default function BaseDataContext(props: {children: ReactNode}) {
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
      searchBarData
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
    }),
    [scenarios, compartments, npis, nodeLists, nodes, groups, groupCategories, simulationModels, geoData, searchBarData]
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
