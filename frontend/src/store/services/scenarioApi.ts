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
  baseQuery: fetchBaseQuery({baseUrl: `${process.env.API_URL || ''}/api/v1/`}),
  endpoints: (builder) => ({
    getSimulationModels: builder.query<SimulationModels, void>({
      query: () => {
        return 'simulationmodels/';
      },
    }),

    getSimulationModel: builder.query<SimulationModel, number>({
      query: (id: number) => {
        return `simulationmodels/${id}/`;
      },
    }),

    getSimulations: builder.query<Simulations, void>({
      query: () => {
        return `simulations/`;
      },
    }),

    getSimulationDataByDate: builder.query<SimulationDataByDate, SimulationDataByDateParameters>({
      async queryFn(arg, _queryApi, _extraOptions, fetchWithBQ) {
        const group = arg.group || 'total';
        const compartments = arg.compartments ? `&compartments=${arg.compartments.join(',')}` : '';
        const url = (limit: number, offset: number) =>
          `simulation/${arg.id}/${arg.day}/${group}/?limit=${limit}&offset=${offset}${compartments}`;

        // We fetch the first 100 entries.
        const firstResult = await fetchWithBQ(url(100, 0));
        // When an error occurs, we return it.
        if (firstResult.error) return {error: firstResult.error};

        const firstData = firstResult.data as SimulationDataByDate;

        // We write the count and results into our aggregated result set.
        const result: SimulationDataByDate = {
          count: firstData.count,
          previous: null,
          next: null,
          results: firstData.results,
        };

        // We continue to request 100 entries at a time until we fetched all data.
        for (let offset = 100; offset <= result.count; offset += 100) {
          const currResult = await fetchWithBQ(url(100, offset));
          if (currResult.error) return {error: currResult.error};

          const currData = currResult.data as SimulationDataByDate;
          result.results.push(...currData.results);
        }

        return {data: result};
      },
    }),

    getSimulationDataByNode: builder.query<SimulationDataByNode, SimulationDataByNodeParameters>({
      query: (arg: SimulationDataByNodeParameters) => {
        const group = arg.group || 'total';
        const compartments = arg.compartments ? `?compartments=${arg.compartments.join(',')}` : '';

        return `simulation/${arg.id}/${arg.node}/${group}/${compartments}`;
      },
    }),

    getSingleSimulationEntry: builder.query<SimulationDataByNode, SingleSimulationEntryParameters>({
      query: (arg: SingleSimulationEntryParameters) => `simulation/${arg.id}/${arg.node}/${arg.group}/?day=${arg.day}`,
    }),
  }),
});

interface SimulationDataByDateParameters {
  id: number;
  day: string;
  group: string | null;
  compartments: Array<string> | null;
}

interface SimulationDataByNodeParameters {
  id: number;
  node: string;
  group: string | null;
  compartments: Array<string> | null;
}

interface SingleSimulationEntryParameters {
  id: number;
  node: string;
  day: string;
  group: string;
}

export const {
  useGetSimulationModelsQuery,
  useGetSimulationModelQuery,
  useGetSimulationsQuery,
  useGetSimulationDataByDateQuery,
  useGetSimulationDataByNodeQuery,
  useGetSingleSimulationEntryQuery,
} = scenarioApi;
