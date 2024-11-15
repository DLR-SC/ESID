// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';

import {NewGroup, Group, Groups, InfectionData, InfectionDataParameters, Model, Models, Scenarios} from './APITypes';

export const scenarioApi = createApi({
  reducerPath: 'scenarioApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_URL || ''}`,
    prepareHeaders: (headers) => {
      headers.set('Authorization', `Bearer TODO`);
      return headers;
    },
  }),
  tagTypes: [
    'Group',
    'Model',
    'Intervention',
    'Node',
    'NodeList',
    'ParameterDefinition',
    'Scenario',
    'Compartment',
    'Aggregation',
  ],

  endpoints: (build) => ({
    getModels: build.query<Models, void>({
      query() {
        return 'models/';
      },
      providesTags: (models = []) => [
        {type: 'Model', id: 'LIST'},
        ...models.map((model) => ({type: 'Model' as const, id: model.id})),
      ],
    }),

    getModel: build.query<Model, string>({
      query(modelId: string) {
        return `models/${modelId}/`;
      },
      providesTags: (_1, _2, modelId) => [{type: 'Model', id: modelId}],
    }),

    getScenarios: build.query<Scenarios, void>({
      query() {
        return `scenarios/`;
      },
      providesTags: (scenarios = []) => [
        {type: 'Scenario', id: 'LIST'},
        ...scenarios.map((scenario) => ({type: 'Scenario' as const, id: scenario.id})),
      ],
    }),

    getScenario: build.query<Scenarios, string>({
      query(scenarioId: string) {
        return `scenarios/${scenarioId}/`;
      },
      providesTags: (_1, _2, modelId) => [{type: 'Scenario', id: modelId}],
    }),

    getScenarioInfectionData: build.query<InfectionData, InfectionDataParameters>({
      query(parameters: InfectionDataParameters) {
        return {
          url: `scenarios/${parameters.path.scenarioId}/`,
          params: parameters.query,
        };
      },
    }),

    getGroups: build.query<Groups, void>({
      query() {
        return `groups/`;
      },
      providesTags: (groups = []) => [
        {type: 'Group', id: 'LIST'},
        ...groups.map((group) => ({type: 'Group' as const, id: group.id})),
      ],
    }),

    getGroup: build.query<Group, string>({
      query(groupId: string) {
        return `groups/${groupId}/`;
      },
      providesTags: (_1, _2, groupId) => [{type: 'Group', id: groupId}],
    }),

    createGroup: build.mutation<string, NewGroup>({
      query(parameters: NewGroup) {
        return {
          url: `groups/`,
          method: 'POST',
          body: parameters,
        };
      },
      invalidatesTags: [{type: 'Group', id: 'LIST'}],
    }),

    deleteGroup: build.mutation<void, string>({
      query(groupId) {
        return {
          url: `groups/${groupId}/`,
          method: 'DELETE',
        };
      },
      invalidatesTags: (_1, _2, groupId) => [
        {type: 'Group', id: groupId},
        {type: 'Group', id: 'LIST'},
      ],
    }),
  }),
});

export interface ParameterRESTData {
  results: {
    name: string;
    description: string;
    simulationModel: string;
    numberOfGroups: number;
    parameters: Array<{parameter: string; groups: Array<{min: number; max: number}>}>;
  };
}

export interface ParameterData {
  symbol: string;
  key: string;
  type: string;
  data: Array<{span: number; min: number; max: number}> | string;
}

export const {
  useGetModelsQuery,
  useGetModelQuery,
  useGetScenariosQuery,
  useGetScenarioInfectionDataQuery,
  useGetGroupsQuery,
  useGetGroupQuery,
  useCreateGroupMutation,
  useDeleteGroupMutation,
} = scenarioApi;
