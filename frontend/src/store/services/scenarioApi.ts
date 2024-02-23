// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {Dictionary} from 'util/util';
import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
import {
  SimulationDataByDate,
  SimulationDataByNode,
  SimulationModel,
  SimulationModels,
  Simulations,
} from '../../types/scenario';

export const scenarioApi = createApi({
  reducerPath: 'scenarioApi',
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  baseQuery: fetchBaseQuery({baseUrl: `${import.meta.env.VITE_API_URL || ''}/api/v1/`}),
  endpoints: (builder) => ({
    getSimulationModels: builder.query<SimulationModels, void>({
      query: () => {
        return 'simulationmodels/';
      },
    }),

    getSimulationModel: builder.query<{results: SimulationModel}, string>({
      query: (key: string) => {
        return `simulationmodels/${key}/`;
      },
    }),

    getSimulations: builder.query<Simulations, void>({
      query: () => {
        return `simulations/`;
      },
    }),

    getSimulationDataByDate: builder.query<SimulationDataByDate, SimulationDataByDateParameters>({
      async queryFn(arg, _queryApi, _extraOptions, fetchWithBQ) {
        const groups = arg.groups && arg.groups.length > 0 ? `&groups=${arg.groups.join(',')}` : '&groups=total';
        const compartments = arg.compartments ? `&compartments=${arg.compartments.join(',')}` : '';

        const currResult = await fetchWithBQ(`simulation/${arg.id}/${arg.day}/?all${groups}${compartments}`);
        if (currResult.error) return {error: currResult.error};

        const data = currResult.data as SimulationDataByDate;

        return {data};
      },
    }),

    getSimulationDataByNode: builder.query<SimulationDataByNode, SimulationDataByNodeParameters>({
      query: (arg: SimulationDataByNodeParameters) => {
        const groups = arg.groups && arg.groups.length > 0 ? `&groups=${arg.groups.join(',')}` : '&groups=total';
        const compartments = arg.compartments ? `&compartments=${arg.compartments.join(',')}&all` : '';

        return `simulation/${arg.id}/${arg.node}/?all${groups}${compartments}`;
      },
    }),

    getSingleSimulationEntry: builder.query<SimulationDataByNode, SingleSimulationEntryParameters>({
      query: (arg: SingleSimulationEntryParameters) =>
        `simulation/${arg.id}/${arg.node}/?all&day=${arg.day}&groups=${
          arg.groups && arg.groups.length > 0 ? arg.groups.join(',') : 'total'
        }`,
    }),

    getMultipleSimulationDataByNode: builder.query<SimulationDataByNode[], MultipleSimulationDataByNodeParameters>({
      async queryFn(arg, _queryApi, _extraOptions, fetchWithBQ) {
        const groups = arg.groups && arg.groups.length > 0 ? `&groups=${arg.groups.join(',')}` : '&groups=total';
        const compartments = arg.compartments ? `&compartments=${arg.compartments.join(',')}` : '';

        const result: SimulationDataByNode[] = [];

        // fetch simulation data for each id
        for (const id of arg.ids) {
          // fetch all entries
          const fullResult = await fetchWithBQ(`simulation/${id}/${arg.node}/?all${groups}${compartments}`);
          // return if errors occur
          if (fullResult.error) return {error: fullResult.error};

          // put result into list to return
          result[id] = fullResult.data as SimulationDataByNode;
        }

        return {data: result};
      },
    }),

    getPercentileData: builder.query<SelectedScenarioPercentileData[], SelectedScenario>({
      async queryFn(arg, _queryApi, _extraOptions, fetchWithBQ) {
        const groups = arg.groups && arg.groups.length > 0 ? `&groups=${arg.groups.join(',')}` : '&groups=total';
        const url = (percentile: number) =>
          `simulation/${arg.id}/${arg.node}/?all&percentile=${percentile}&compartments=${arg.compartment}${groups}`;

        const result: SelectedScenarioPercentileData[] = [];

        const percentile25 = await fetchWithBQ(url(25));
        //return if errors occur
        if (percentile25.error) return {error: percentile25.error};
        result[0] = percentile25.data as SelectedScenarioPercentileData;

        const percentile75 = await fetchWithBQ(url(75));
        //return if errors occur
        if (percentile75.error) return {error: percentile75.error};
        result[1] = percentile75.data as SelectedScenarioPercentileData;

        return {data: result};
      },
    }),
  }),
});

interface SelectedScenario {
  id: number;
  node: string;
  groups: Array<string> | null;
  compartment: string;
}

export interface SelectedScenarioPercentileData {
  count: number;
  next: null;
  previous: null;
  results: Array<PercentileDataByDay> | null;
}

export interface PercentileDataByDay {
  compartments: Dictionary<number>;
  day: string;
}

interface SimulationDataByDateParameters {
  id: number;
  day: string;
  groups: Array<string> | null;
  compartments: Array<string> | null;
}

interface SimulationDataByNodeParameters {
  id: number;
  node: string;
  groups: Array<string> | null;
  compartments: Array<string> | null;
}

interface SingleSimulationEntryParameters {
  id: number;
  node: string;
  day: string;
  groups: Array<string> | null;
}

interface MultipleSimulationDataByNodeParameters {
  ids: number[];
  node: string;
  groups: Array<string> | null;
  compartments: Array<string> | null;
}

export const {
  useGetSimulationModelsQuery,
  useGetSimulationModelQuery,
  useGetSimulationsQuery,
  useGetSimulationDataByDateQuery,
  useGetSimulationDataByNodeQuery,
  useGetSingleSimulationEntryQuery,
  useGetMultipleSimulationDataByNodeQuery,
  useGetPercentileDataQuery,
} = scenarioApi;
