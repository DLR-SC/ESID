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
  baseQuery: fetchBaseQuery({baseUrl: `${process.env.API_URL || ''}/api/v1/`}),
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

    getMultipleSimulationDataByDate: builder.query<SimulationDataByDate[], MultipleSimulationDataByDateParameters>({
      async queryFn(arg, _queryApi, _extraOptions, fetchWithBQ) {
        const group = arg.group || 'total';
        const compartments = arg.compartments ? `&compartments=${arg.compartments.join(',')}` : '';
        const url = (id:number, limit: number, offset: number) =>
          `simulation/${id}/${arg.day}/${group}/?limit=${limit}&offset=${offset}${compartments}`;
      
        const result: SimulationDataByDate[] = [];

        // fetch simulation data for each id
        for (const id of arg.ids) {  
           // fetch first entry to get total count
           const preResult = await fetchWithBQ(url(id,1,0));
           // return if errors occur
           if (preResult.error) return {error: preResult.error};
           const preData = preResult.data as SimulationDataByDate         
           // fetch all enteries
          const fullResult = await fetchWithBQ(url(id, preData.count, 0));
          if (fullResult.error) return {error: fullResult.error};
           // put result into list to return
           result[id] = fullResult.data as SimulationDataByDate;
      }
      return {data:result};
      },
    }),

    getSimulationDataByDate: builder.query<SimulationDataByDate, SimulationDataByDateParameters>({
      async queryFn(arg, _queryApi, _extraOptions, fetchWithBQ) {
        const group = arg.group || 'total';
        const compartments = arg.compartments ? `compartments=${arg.compartments.join(',')}` : '';

        const currResult = await fetchWithBQ(`simulation/${arg.id}/${arg.day}/${group}/?${compartments}&all`);
        if (currResult.error) return {error: currResult.error};

        const data = currResult.data as SimulationDataByDate;

        return {data};
      },
    }),

    getSimulationDataByNode: builder.query<SimulationDataByNode, SimulationDataByNodeParameters>({
      query: (arg: SimulationDataByNodeParameters) => {
        const group = arg.group || 'total';
        const compartments = arg.compartments ? `?compartments=${arg.compartments.join(',')}&all` : '';

        return `simulation/${arg.id}/${arg.node}/${group}/${compartments}`;
      },
    }),

    getSingleSimulationEntry: builder.query<SimulationDataByNode, SingleSimulationEntryParameters>({
      query: (arg: SingleSimulationEntryParameters) => `simulation/${arg.id}/${arg.node}/${arg.group}/?day=${arg.day}`,
    }),

    getMultipleSimulationDataByNode: builder.query<SimulationDataByNode[], MultipleSimulationDataByNodeParameters>({
      async queryFn(arg, _queryApi, _extraOptions, fetchWithBQ) {
        const group = arg.group || 'total';
        const compartments = arg.compartments ? `compartments=${arg.compartments.join(',')}` : '';

        const result: SimulationDataByNode[] = [];

        // fetch simulation data for each id
        for (const id of arg.ids) {
          // fetch all entries
          const fullResult = await fetchWithBQ(`simulation/${id}/${arg.node}/${group}/?${compartments}`);
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
        const group = arg.group || 'total';
        const url = (percentile: number) =>
          `simulation/${arg.id}/${arg.node}/${group}/?percentile=${percentile}&compartments=${arg.compartment}`;

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
  group: string;
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

interface MultipleSimulationDataByNodeParameters {
  ids: number[];
  node: string;
  group: string | null;
  compartments: Array<string> | null;
}

interface MultipleSimulationDataByDateParameters {
  ids: number[];
  day: string;
  node: string;
  group: string | null;
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
  useGetMultipleSimulationDataByDateQuery,
  useGetPercentileDataQuery,
} = scenarioApi;
