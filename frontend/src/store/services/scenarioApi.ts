// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';

import {
  Group,
  Groups,
  InfectionData,
  InfectionDataParameters,
  Model,
  Models,
  Scenarios,
  Identifiable,
  NewScenario,
  InterventionTemplates,
  InterventionTemplate,
  NewInterventionTemplate,
  Nodes,
  NodeLists,
  Compartments,
  Compartment,
  ParameterDefinitions,
  ParameterDefinition,
  Scenario,
  GroupCategories,
} from './APITypes';
import {RootState} from '../index';

export const scenarioApi = createApi({
  reducerPath: 'scenarioApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_URL || ''}`,
    prepareHeaders: (headers, {getState}) => {
      const auth = (getState() as RootState).auth;

      if (auth.realm && auth.realm !== '') {
        headers.set('x-realm', auth.realm);
      }

      if (auth.token && auth.token !== '') {
        headers.set('Authorization', 'Bearer ' + auth.token);
      }

      return headers;
    },
  }),
  tagTypes: [
    'Group',
    'Model',
    'InterventionTemplate',
    'Node',
    'NodeList',
    'ParameterDefinition',
    'Scenario',
    'Compartment',
    'Aggregation',
  ],

  endpoints: (build) => ({
    // Scenarios -------------------------------------------------------------------------------------------------------

    getScenarios: build.query<Scenarios, void>({
      query() {
        return `scenarios/`;
      },
      providesTags: (scenarios = []) => [
        {type: 'Scenario', id: 'LIST'},
        ...scenarios.map((scenario) => ({type: 'Scenario' as const, id: scenario.id})),
      ],
    }),

    createScenario: build.mutation<Identifiable, NewScenario>({
      query(parameters) {
        return {
          url: `scenarios/`,
          method: 'POST',
          body: parameters,
        };
      },
      invalidatesTags: [{type: 'Scenario', id: 'LIST'}],
    }),

    getScenario: build.query<Scenario, string>({
      query(scenarioId: string) {
        return `scenarios/${scenarioId}/`;
      },
      providesTags: (_1, _2, modelId) => [{type: 'Scenario', id: modelId}],
    }),

    deleteScenario: build.mutation<void, string>({
      query(scenarioId) {
        return {
          url: `scenarios/${scenarioId}/`,
          method: 'DELETE',
        };
      },
      invalidatesTags: (_1, _2, scenarioId) => [
        {type: 'Scenario', id: scenarioId},
        {type: 'Scenario', id: 'LIST'},
      ],
    }),

    getScenarioInfectionData: build.query<InfectionData, InfectionDataParameters>({
      query(parameters: InfectionDataParameters) {
        return {
          url: `scenarios/${parameters.path.scenarioId}/infectiondata`,
          params: parameters.query,
        };
      },
      providesTags: (_1, _2, parameters) => [{type: 'Scenario', id: parameters.path.scenarioId}],
    }),

    getMultiScenarioInfectionData: build.query<
      Record<string, InfectionData>,
      {pathIds: Array<string>} & Pick<InfectionDataParameters, 'query'>
    >({
      async queryFn(parameters, _2, _3, fetchWithBQ) {
        const results: Record<string, InfectionData> = {};

        for (const id of parameters.pathIds) {
          const response = await fetchWithBQ({
            url: `scenarios/${id}/infectiondata`,
            params: parameters.query,
          });

          if (response.error) {
            return {error: response.error};
          }

          results[id] = response.data as InfectionData;
        }

        return {data: results};
      },
      providesTags: (infectionDatasets: Record<string, InfectionData> = {}) => [
        {type: 'Scenario', id: 'LIST'},
        ...Object.keys(infectionDatasets).map((scenarioId) => ({type: 'Scenario' as const, id: scenarioId})),
      ],
    }),

    // Interventions ---------------------------------------------------------------------------------------------------

    getInterventionTemplates: build.query<InterventionTemplates, void>({
      query() {
        return 'interventions/templates/';
      },
      providesTags: (interventionTemplates = []) => [
        {type: 'InterventionTemplate', id: 'LIST'},
        ...interventionTemplates.map((template) => ({type: 'InterventionTemplate' as const, id: template.id})),
      ],
    }),

    getInterventionTemplate: build.query<InterventionTemplate, string>({
      query(templateId: string) {
        return `interventions/templates/${templateId}/`;
      },
      providesTags: (_1, _2, templateId) => [{type: 'InterventionTemplate', id: templateId}],
    }),

    createInterventionTemplate: build.mutation<Identifiable, NewInterventionTemplate>({
      query(parameters: NewInterventionTemplate) {
        return {
          url: `interventions/templates/`,
          method: 'POST',
          body: parameters,
        };
      },
      invalidatesTags: [{type: 'InterventionTemplate', id: 'LIST'}],
    }),

    deleteInterventionTemplate: build.mutation<void, string>({
      query(templateId) {
        return {
          url: `interventions/templates/${templateId}/`,
          method: 'DELETE',
        };
      },
      invalidatesTags: (_1, _2, templateId) => [
        {type: 'InterventionTemplate', id: templateId},
        {type: 'InterventionTemplate', id: 'LIST'},
      ],
    }),

    // Models ----------------------------------------------------------------------------------------------------------

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

    // Nodes -----------------------------------------------------------------------------------------------------------

    getNodes: build.query<Nodes, void>({
      query() {
        return `nodes/`;
      },
      providesTags: (nodes = []) => [
        {type: 'Node', id: 'LIST'},
        ...nodes.map((node) => ({type: 'Node' as const, id: node.id})),
      ],
    }),

    getNode: build.query<Node, string>({
      query(nodeId: string) {
        return `nodes/${nodeId}/`;
      },
      providesTags: (_1, _2, nodes) => [{type: 'Node', id: nodes}],
    }),

    getNodeLists: build.query<NodeLists, void>({
      query() {
        return `nodelists/`;
      },
      providesTags: (nodeLists = []) => [
        {type: 'NodeList', id: 'LIST'},
        ...nodeLists.map((nodeList) => ({type: 'NodeList' as const, id: nodeList.id})),
      ],
    }),

    getNodeList: build.query<NodeList, string>({
      query(nodeListId: string) {
        return `nodelists/${nodeListId}/`;
      },
      providesTags: (_1, _2, nodeListId) => [{type: 'NodeList', id: nodeListId}],
    }),

    // Groups ----------------------------------------------------------------------------------------------------------

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

    getGroupCategories: build.query<GroupCategories, void>({
      query() {
        return 'groups/categories/';
      },
      providesTags: [{type: 'Group', id: 'LIST'}],
    }),

    // Compartments ----------------------------------------------------------------------------------------------------

    getCompartments: build.query<Compartments, void>({
      query() {
        return 'compartments/';
      },
      providesTags: (compartments = []) => [
        {type: 'Compartment', id: 'LIST'},
        ...compartments.map((compartment) => ({type: 'Compartment' as const, id: compartment.id})),
      ],
    }),

    getCompartment: build.query<Compartment, string>({
      query(compartmentId: string) {
        return `compartments/${compartmentId}/`;
      },
      providesTags: (_1, _2, compartmentId) => [{type: 'Compartment', id: compartmentId}],
    }),

    // ParameterDefinitions --------------------------------------------------------------------------------------------

    getParameterDefinitions: build.query<ParameterDefinitions, void>({
      query() {
        return 'parameterdefinitions/';
      },
      providesTags: (parameterDefinitions = []) => [
        {type: 'ParameterDefinition', id: 'LIST'},
        ...parameterDefinitions.map((parameterDefinition) => ({
          type: 'ParameterDefinition' as const,
          id: parameterDefinition.id,
        })),
      ],
    }),

    getParameterDefinition: build.query<ParameterDefinition, string>({
      query(parameterDefinitionId: string) {
        return `parameterdefinitions/${parameterDefinitionId}/`;
      },
      providesTags: (_1, _2, parameterDefinitionId) => [{type: 'ParameterDefinition', id: parameterDefinitionId}],
    }),

    getMultiParameterDefinitions: build.query<Record<string, ParameterDefinition>, Array<string>>({
      async queryFn(parameters, _2, _3, fetchWithBQ) {
        const results: Record<string, ParameterDefinition> = {};

        for (const id of parameters) {
          const response = await fetchWithBQ({
            url: `parameterdefinitions/${id}/`,
          });

          if (response.error) {
            return {error: response.error};
          }

          results[id] = response.data as ParameterDefinition;
        }

        return {data: results};
      },
      providesTags: (parameters: Record<string, ParameterDefinition> = {}) => [
        {type: 'ParameterDefinition', id: 'LIST'},
        ...Object.keys(parameters).map((parameterId) => ({type: 'ParameterDefinition' as const, id: parameterId})),
      ],
    }),
  }),
});

export interface ParameterData {
  id: string;
  symbol: string;
  description: string;
  unit: string;
  type: string;
  data: Array<{span: number; min: number; max: number}> | string;
}

export const {
  useGetScenariosQuery,
  useCreateScenarioMutation,
  useGetScenarioQuery,
  useDeleteScenarioMutation,
  useGetScenarioInfectionDataQuery,
  useGetMultiScenarioInfectionDataQuery,
  useGetInterventionTemplatesQuery,
  useCreateInterventionTemplateMutation,
  useGetInterventionTemplateQuery,
  useDeleteInterventionTemplateMutation,
  useGetModelsQuery,
  useGetModelQuery,
  useGetNodesQuery,
  useGetNodeQuery,
  useGetNodeListsQuery,
  useGetNodeListQuery,
  useGetGroupsQuery,
  useGetGroupQuery,
  useGetGroupCategoriesQuery,
  useGetCompartmentsQuery,
  useGetCompartmentQuery,
  useGetParameterDefinitionsQuery,
  useGetParameterDefinitionQuery,
  useGetMultiParameterDefinitionsQuery,
} = scenarioApi;
