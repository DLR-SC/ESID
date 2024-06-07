// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
import {CaseDataByDate, CaseDataByNode} from '../../types/caseData';
import {SimulationDataByNode} from '../../types/scenario';
/* [CDtemp-begin] */
import cologneData from '../../../assets/stadtteile_cologne_list.json';
import {District} from 'types/cologneDisticts';
import {deepCopy} from '../../util/util';
/* [CDtemp-end] */

export const caseDataApi = createApi({
  reducerPath: 'caseDataApi',
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  baseQuery: fetchBaseQuery({baseUrl: `${import.meta.env.VITE_API_URL || ''}/api/v1/rki/`}),
  endpoints: (builder) => ({
    getCaseDataByDistrict: builder.query<CaseDataByNode, CaseDataByDistrictParameters>({
      async queryFn(arg, _queryApi, _extraOptions, fetchWithBQ) {
        const groups = arg.groups && arg.groups.length > 0 ? `&groups=${arg.groups.join(',')}` : '&groups=total';
        const compartments = arg.compartments ? `&compartments=${arg.compartments.join(',')}` : '';

        /* [CDtemp-begin] */
        let cologneDistrict = '';
        let node = '';
        // check if node is cologne city district (8 digits instead of 5)
        if (arg.node.length > 5) {
          // store city district (last 3)
          cologneDistrict = arg.node.slice(-3);
          // restore node to fetch cologne data
          node = arg.node.slice(0, 5);
          console.log(arg.node, cologneDistrict);
        } else {
          node = arg.node;
        }
        /* [CDtemp-end] */
        // fetch all days
        const queryResult = await fetchWithBQ(
          `/${
            /* [CDtemp-begin] */
            // arg.node
            node
            /* [CDtemp-end] */
          }/?all${groups}${compartments}`
        );
        // return error if any occurs
        if (queryResult.error) return {error: queryResult.error};

        const result = queryResult.data as CaseDataByNode;
        /* [CDtemp-begin] */
        // if node was cologne district apply weight and modify node id
        if (cologneDistrict) {
          result.results = result.results.map(({day, compartments}) => {
            // find district info by Stadtteil_ID (cut before)
            const dist = (cologneData as unknown as Array<District>).find(
              (dist) => dist.Stadtteil_ID == cologneDistrict
            );
            Object.keys(compartments).forEach((compartmentName) => {
              // apply district weight
              compartments[compartmentName] *= dist!.Population_rel;
            });
            // return modified results
            return {day, compartments};
          });
        }
        /* [CDtemp-end] */
        return {data: result};
      },
    }),

    getCaseDataByDate: builder.query<CaseDataByDate, CaseDataByDateParameters>({
      async queryFn(arg, _queryApi, _extraOptions, fetchWithBQ) {
        const groups = arg.groups && arg.groups.length > 0 ? `&groups=${arg.groups.join(',')}` : '&groups=total';
        const compartments = arg.compartments ? `&compartments=${arg.compartments.join(',')}` : '';

        // fetch all days
        const queryResult = await fetchWithBQ(`/${arg.day}/?all${groups}${compartments}`);
        // return error if any occurs
        if (queryResult.error) return {error: queryResult.error};

        const result = queryResult.data as CaseDataByDate;
        /* [CDtemp-begin] */
        // get data for cologne
        const cologneResult = result.results.find((res) => res.name === '05315');
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
            result.results.push({
              name: `05315${dist.Stadtteil_ID}`,
              compartments: districtCompartments,
            });
          });
        }
        /* [CDtemp-end] */
        return {data: result};
      },
    }),

    // [CDtemp-begin]
    /*
    // [CDtemp-end]
    getCaseDataSingleSimulationEntry: builder.query<SimulationDataByNode, CaseDataSingleSimulationEntryParameters>({
      query: (arg: CaseDataSingleSimulationEntryParameters) =>
        `${arg.node}/?all&day=${arg.day}&groups=${
          arg.groups && arg.groups.length > 0 ? arg.groups.join(',') : 'total'
        }`,
    }),
    // [CDtemp-begin]
    */
    getCaseDataSingleSimulationEntry: builder.query<SimulationDataByNode, CaseDataSingleSimulationEntryParameters>({
      async queryFn(arg, _queryApi, _extraOptions, fetchWithBQ) {
        const day = arg.day ? `&day=${arg.day}` : '';
        const groups = arg.groups && arg.groups.length > 0 ? `&groups=${arg.groups.join(',')}` : '&groups=total';

        let cologneDistrict = '';
        // check if node is cologne city district (8 digits instead of 5)
        if (arg.node.length > 5) {
          // store city district (last 3)
          cologneDistrict = arg.node.slice(-3);
        }

        // fetch data
        const queryResult = await fetchWithBQ(`${arg.node}/?all${day}${groups}`);
        // return error if any occurs
        if (queryResult.error) return {error: queryResult.error};
        const result = queryResult.data as SimulationDataByNode;

        // if node was cologne district apply weight
        if (cologneDistrict) {
          const distWeight = (cologneData as unknown as Array<District>).find(
            (dist) => dist.Stadtteil_ID === cologneDistrict
          )!.Population_rel;
          // loop through days array
          // overwrite cologne results with weighted district results
          result.results = result.results.map(({day, compartments}) => {
            // loop through available compartments and apply weight
            Object.keys(compartments).forEach((compName) => {
              compartments[compName] *= distWeight;
            });
            return {day, compartments};
          });
        }

        return {data: result};
      },
    }),
    // [CDtemp-end]
  }),
});

interface CaseDataByDistrictParameters {
  node: string;
  groups: Array<string> | null;
  compartments: Array<string> | null;
}

interface CaseDataByDateParameters {
  day: string;
  groups: Array<string> | null;
  compartments: Array<string> | null;
}

interface CaseDataSingleSimulationEntryParameters {
  node: string;
  day: string;
  groups: Array<string> | null;
}

export const {useGetCaseDataByDateQuery, useGetCaseDataByDistrictQuery, useGetCaseDataSingleSimulationEntryQuery} =
  caseDataApi;
