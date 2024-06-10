// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {deepCopy, Dictionary} from 'util/util';
import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
import {
  SimulationDataByDate,
  SimulationDataByNode,
  SimulationModel,
  SimulationModels,
  Simulations,
} from '../../types/scenario';
        /* [CDtemp-begin] */
import cologneData from '../../../assets/stadtteile_cologne_list.json';
import {District} from '../../types/cologneDisticts';
        /* [CDtemp-end] */


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
        /* [CDtemp-begin] */
        // get data for cologne
        const cologneResult = data.results.find((res) => res.name === '05315');
        // if cologne is in results also calculate districts
        if (cologneResult) {
          // loop thru cologne districts
          (cologneData as unknown as Array<District>).forEach((dist) => {
            // calculate compartment data
            const districtCompartments = deepCopy(cologneResult.compartments);
            // loop thru compartments
            Object.keys(districtCompartments).forEach((compName) => {
              // apply district weight
              districtCompartments[compName] *= dist.Population_rel;
            });
            // create result entry for district
            data.results.push({
              name: `05315${dist.Stadtteil_ID}`,
              compartments: districtCompartments,
            });
          });
        }
        /* [CDtemp-end] */
        return {data};
      },
    }),

    getSimulationDataByNode: builder.query<SimulationDataByNode, SimulationDataByNodeParameters>({
      async queryFn (arg, _queryApi, _extraOptions, fetchWithBQ) {
        const groups = arg.groups && arg.groups.length > 0 ? `&groups=${arg.groups.join(',')}` : '&groups=total';
        const compartments = arg.compartments ? `&compartments=${arg.compartments.join(',')}&all` : '';

        /* [CDtemp-begin] */
        let cologneDistrict = '';
        let node = '';

        // check if node is cologne district (8 digits instead of 5)
        if (arg.node.length > 5) {
          // store city district (last 3)
          cologneDistrict = arg.node.slice(-3);
          // restore node to fetch cologne data
          node = arg.node.slice(0,5);
        } else {
          node = arg.node;
        }
        /* [CDtemp-end] */
        
        const currResult = await fetchWithBQ(
          `simulation/${arg.id}/${
            /* [CDtemp-begin] */
            // arg.node
            node
            /* [CDtemp-end] */
          }/?all${groups}${compartments}`
        );
        if (currResult.error) return {error: currResult.error};
        const data = currResult.data as SimulationDataByNode;

        /* [CDtemp-begin] */
        // if node was cologne district apply weight
        if (cologneDistrict) {
          const weight = (cologneData as unknown as Array<District>).find(
            (dist) => dist.Stadtteil_ID === cologneDistrict
          )!.Population_rel;
          // loop thru days and overwrite cologne result with weighted result
          data.results = data.results.map(({day, compartments}) => {
            //loop through compartments and apply weight
            Object.keys(compartments).forEach((compName) => {
              compartments[compName] *= weight;
            });
            return {day, compartments};
          });
        }
        /* [CDtemp-end] */
        return {data: data}
      },
    }),

    getSingleSimulationEntry: builder.query<SimulationDataByNode, SingleSimulationEntryParameters>({
      async queryFn (arg, _queryApi, _extraOptions, fetchWithBQ) {
        const day = arg.day ? `&day=${arg.day}` : '';
        const groups = arg.groups && arg.groups.length > 0 ? `&groups=${arg.groups.join(',')}` : '&groups=total';
        
        /* [CDtemp-begin] */
        let cologneDistrict = '';
        let node = '';

        // check if node is cologne district (8 digits instead of 5)
        if (arg.node.length > 5) {
          // store city district (last 3)
          cologneDistrict = arg.node.slice(-3);
          // restore node to fetch cologne data
          node = arg.node.slice(0,5);
        } else {
          node = arg.node;
        }
        /* [CDtemp-end] */
        
        const currResult = await fetchWithBQ(
          `simulation/${arg.id}/${
            /* [CDtemp-begin] */
            // arg.node
            node
            /* [CDtemp-end] */
          }/?all${day}${groups}`
        );
        if (currResult.error) return {error: currResult.error};
        const data = currResult.data as SimulationDataByNode;
        
        /* [CDtemp-begin] */
        // if node was cologne district apply weight
        if (cologneDistrict) {
          const weight = (cologneData as unknown as Array<District>).find(
            (dist) => dist.Stadtteil_ID === cologneDistrict
          )!.Population_rel;
          // loop thru days and overwrite cologne result with weighted result
          data.results = data.results.map(({day, compartments}) => {
            //loop through compartments and apply weight
            Object.keys(compartments).forEach((compName) => {
              compartments[compName] *= weight;
            });
            return {day, compartments};
          });
        }
        /* [CDtemp-end] */
        return {data: data};
      }
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

    getScenarioParameters: builder.query<Array<ParameterData>, number>({
      queryFn: async function (arg: number, _queryApi, _extraOptions, fetchWithBQ) {
        const response = await fetchWithBQ(`scenarios/${arg}/`);
        if (response.error) return {error: response.error};
        const parameters = response.data as ParameterRESTData;

        const result: Array<ParameterData> = parameters.results.parameters.map((parameter) => {
          const groupData = parameter.groups.slice(0, 6).map((group) => ({span: 1, min: group.min, max: group.max}));
          const mergedGroupData = [groupData[0]];

          for (let i = 1; i < groupData.length; i++) {
            const prev = mergedGroupData[mergedGroupData.length - 1];
            const curr = groupData[i];
            if (prev.min == curr.min && prev.max == curr.max) {
              prev.span++;
            } else {
              mergedGroupData.push(curr);
            }
          }

          return {
            key: parameter.parameter,
            symbol: 'x',
            type: 'MIN_MAX_GROUPED',
            data: mergedGroupData,
          };
        });

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
  useGetScenarioParametersQuery,
} = scenarioApi;
