import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
import {SimulationDataByDate, SimulationDataByNode, SimulationModels, Simulations} from '../../types/scenario';
import {dateToISOString} from '../../util/util';

export const scenarioApi = createApi({
  reducerPath: 'scenarioApi',
  baseQuery: fetchBaseQuery({baseUrl: `${process.env.API_URL || ''}/api/v1/`}),
  endpoints: (builder) => ({
    getSimulationModels: builder.query<SimulationModels, unknown>({
      query: () => {
        return 'simulationmodels/';
      },
    }),
    getSimulationModel: builder.query<SimulationModels, number>({
      query: (id: number) => {
        return `simulationmodels/${id}`;
      },
    }),
    getSimulations: builder.query<Simulations, unknown>({
      query: () => {
        return `simulations/`;
      },
    }),
    getSimulationDataByDate: builder.query<SimulationDataByDate, SimulationDataByDateParameters>({
      query: (arg: SimulationDataByDateParameters) => {
        const day = dateToISOString(arg.day);
        const group = arg.group || 'total';
        const compartments = arg.compartments ? `?compartments=${arg.compartments.join(',')}` : '';

        return `simulation/${arg.id}/${day}/${group}/${compartments}`;
      },
    }),
    getSimulationDataByNode: builder.query<SimulationDataByNode, SimulationDataByNodeParameters>({
      query: (arg: SimulationDataByNodeParameters) => {
        const group = arg.group || 'total';
        const compartments = arg.compartments ? `?compartments=${arg.compartments.join(',')}` : '';

        return `simulation/${arg.id}/${arg.node}/${group}/${compartments}`;
      },
    }),
  }),
});

interface SimulationDataByDateParameters {
  id: number;
  day: Date | number;
  group: string | null;
  compartments: Array<string> | null;
}

interface SimulationDataByNodeParameters {
  id: number;
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
} = scenarioApi;