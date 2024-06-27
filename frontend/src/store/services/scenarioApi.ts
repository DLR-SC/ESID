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
import { District } from 'types/cologneDistricts';

/** Checks if input node is a city district and returns the node to fetch data, and the city distrct suffix if there is one */
function validateDistrictNode(inNode: string): {node: string; cologneDistrict?: string} {
  if (inNode.length > 5) {
    return {node: inNode.slice(0, 5), cologneDistrict: inNode.slice(-3)};
  }
  return {node: inNode.slice(0, 5)};
}

/** Applies the city district weight if a district suffix is supplied */
function modifyDistrictResults(cologneDistrict: string | undefined, data: SimulationDataByNode): SimulationDataByNode {
  // pass data if it is not for a city district
  if (!cologneDistrict) return data;

  // find weight for city district
  const weight = (cologneData as unknown as Array<District>).find(
    (dist) => dist.Stadtteil_ID === cologneDistrict
  )!.Population_rel;

  // loop thru days in data to replace compartment data
  data.results = data.results.map(({day, compartments}) => {
    // loop through compartments and apply weight
    Object.keys(compartments).forEach((compName) => {
      compartments[compName] *= weight;
    });
    return {day, compartments};
  });
  // return modified data
  return data;
}
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
      async queryFn(arg, _queryApi, _extraOptions, fetchWithBQ) {
        const groups = arg.groups && arg.groups.length > 0 ? `&groups=${arg.groups.join(',')}` : '&groups=total';
        const compartments = arg.compartments ? `&compartments=${arg.compartments.join(',')}&all` : '';

        /* [CDtemp-begin] */
        const {node, cologneDistrict} = validateDistrictNode(arg.node);
        /* [CDtemp-end] */

        const currResult = await fetchWithBQ(
          `simulation/${arg.id}/${
            // [CDtemp] arg.node
            node
          }/?all${groups}${compartments}`
        );
        if (currResult.error) return {error: currResult.error};
        // [CDtemp] const data = currResult.data as SimulationDataByNode;

        /* [CDtemp-begin] */
        // if node was cologne district apply weight
        const data = modifyDistrictResults(cologneDistrict, currResult.data as SimulationDataByNode);
        /* [CDtemp-end] */
        return {data: data};
      },
    }),

    getSingleSimulationEntry: builder.query<SimulationDataByNode, SingleSimulationEntryParameters>({
      async queryFn(arg, _queryApi, _extraOptions, fetchWithBQ) {
        const day = arg.day ? `&day=${arg.day}` : '';
        const groups = arg.groups && arg.groups.length > 0 ? `&groups=${arg.groups.join(',')}` : '&groups=total';

        /* [CDtemp-begin] */
        const {node, cologneDistrict} = validateDistrictNode(arg.node);
        /* [CDtemp-end] */

        const currResult = await fetchWithBQ(
          `simulation/${arg.id}/${
            // [CDtemp] arg.node
            node
          }/?all${day}${groups}`
        );
        if (currResult.error) return {error: currResult.error};
        // [CDtemp] const data = currResult.data as SimulationDataByNode;

        /* [CDtemp-begin] */
        const data = modifyDistrictResults(cologneDistrict, currResult.data as SimulationDataByNode);
        /* [CDtemp-end] */
        return {data: data};
      },
    }),

    getMultipleSimulationEntry: builder.query<SimulationDataByNode[], MultipleSimulationEntryParameters>({
      async queryFn(arg, _queryApi, _extraOptions, fetchWithBQ) {
        const day = arg.day ? `&day=${arg.day}` : '';
        const groups = arg.groups && arg.groups.length > 0 ? `&groups=${arg.groups.join(',')}` : '&groups=total';

        const result: SimulationDataByNode[] = [];
        /* [CDtemp-begin] */
        const {node, cologneDistrict} = validateDistrictNode(arg.node);
        /* [CDtemp-end] */
        for (const id of arg.ids){
          const fullResult = await fetchWithBQ(
          `simulation/${id}/${
            // [CDtemp] arg.node
            node
          }/?all${day}${groups}`
        );
        if (fullResult.error) return {error: fullResult.error};
        // [CDtemp] const data = currResult.data as SimulationDataByNode;
        /* [CDtemp-begin] */
        const data = modifyDistrictResults(cologneDistrict, fullResult.data as SimulationDataByNode);

        /* [CDtemp-end] */
        result[id] = data;
      }
      return {data: result};
    },
    }),

    getMultipleSimulationDataByNode: builder.query<SimulationDataByNode[], MultipleSimulationDataByNodeParameters>({
      async queryFn(arg, _queryApi, _extraOptions, fetchWithBQ) {
        const groups = arg.groups && arg.groups.length > 0 ? `&groups=${arg.groups.join(',')}` : '&groups=total';
        const compartments = arg.compartments ? `&compartments=${arg.compartments.join(',')}` : '';

        const result: SimulationDataByNode[] = [];

        /* [CDtemp-begin] */
        const {node, cologneDistrict} = validateDistrictNode(arg.node);
        /* [CDtemp-end] */

        // fetch simulation data for each id
        for (const id of arg.ids) {
          // fetch entry
          const fullResult = await fetchWithBQ(
            `simulation/${id}/${
              // [CDtemp] arg.node
              node
            }/?all${groups}${compartments}`
          );
          // return if errors occur
          if (fullResult.error) return {error: fullResult.error};
          // [CDtemp] const data = fullResult.data as SimulationDataByNode;

          /* [CDtemp-begin] */
          const data = modifyDistrictResults(cologneDistrict, fullResult.data as SimulationDataByNode);
          /* [CDtemp-end] */

          // put result into list to return
          result[id] = data;
        }

        return {data: result};
      },
    }),

    getPercentileData: builder.query<SelectedScenarioPercentileData[], SelectedScenario>({
      async queryFn(arg, _queryApi, _extraOptions, fetchWithBQ) {
        const groups = arg.groups && arg.groups.length > 0 ? `&groups=${arg.groups.join(',')}` : '&groups=total';
        const compartments = arg.compartment ? `&compartments=${arg.compartment}` : '';

        /* [CDtemp-begin] */
        const {node, cologneDistrict} = validateDistrictNode(arg.node);
        /* [CDtemp-end] */

        const url = (percentile: number) =>
          `simulation/${arg.id}/${
            // [CDtemp] arg.node
            node
          }/?all&percentile=${percentile}${compartments}${groups}`;

        const result: SelectedScenarioPercentileData[] = [];

        const percentile25 = await fetchWithBQ(url(25));
        //return if errors occur
        if (percentile25.error) return {error: percentile25.error};
        result[0] = percentile25.data as SelectedScenarioPercentileData;

        const percentile75 = await fetchWithBQ(url(75));
        //return if errors occur
        if (percentile75.error) return {error: percentile75.error};
        result[1] = percentile75.data as SelectedScenarioPercentileData;

        /* [CDtemp-begin] */
        if (cologneDistrict) {
          // get weight for city district
          const weight = (cologneData as unknown as Array<District>).find(
            (dist) => dist.Stadtteil_ID === cologneDistrict
          )!.Population_rel;

          // loop through both results to adjust city district results
          return {
            data: result.map((percData) => {
              // skip if results are null
              if (percData.results === null) return percData;

              // loop thru days in data to replace compartment data
              percData.results = percData.results.map(({day, compartments}) => {
                // loop through compartments and apply weight
                Object.keys(compartments).forEach((compName) => {
                  compartments[compName] *= weight;
                });
                return {day, compartments};
              });
              // return omdified data
              return percData;
            }),
          };
        }
        /* [CDtemp-end] */

        return {data: result};
      },
    }),

    getScenarioParameters: builder.query<Array<ParameterData> | null, number | null>({
      queryFn: async function (arg: number | null, _queryApi, _extraOptions, fetchWithBQ) {
        if (!arg) {
          return {data: null};
        }

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

interface MultipleSimulationEntryParameters {
  ids: number[];
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
  useGetMultipleSimulationEntryQuery,
  useGetMultipleSimulationDataByNodeQuery,
  useGetPercentileDataQuery,
  useGetScenarioParametersQuery,
} = scenarioApi;