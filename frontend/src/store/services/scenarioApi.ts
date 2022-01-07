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
    getSimulationModels: builder.query<SimulationModels, unknown>({
      query: () => {
        return 'simulationmodels/';
      },
    }),

    getSimulationModel: builder.query<SimulationModel, number>({
      query: (id: number) => {
        return `simulationmodels/${id}/`;
      },
    }),

    getSimulations: builder.query<Simulations, unknown>({
      query: () => {
        return `simulations/`;
      },
    }),

    getSimulationDataByDate: builder.query<SimulationDataByDate, SimulationDataByDateParameters>({
      query: (arg: SimulationDataByDateParameters) => {
        const group = arg.group || 'total';
        const compartments = arg.compartments ? `?compartments=${arg.compartments.join(',')}` : '';

        return `simulation/${arg.id}/${arg.day}/${group}/${compartments}`;
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

export const {
  useGetSimulationModelsQuery,
  useGetSimulationModelQuery,
  useGetSimulationsQuery,
  useGetSimulationDataByDateQuery,
  useGetSimulationDataByNodeQuery,
} = scenarioApi;
