// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
import {CaseDataByDate, CaseDataByNode} from '../../types/caseData';
import {SimulationDataByNode} from '../../types/scenario';

export const caseDataApi = createApi({
  reducerPath: 'caseDataApi',
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  baseQuery: fetchBaseQuery({baseUrl: `${import.meta.env.VITE_API_URL || ''}/api/v1/rki/`}),
  endpoints: (builder) => ({
    getCaseDataByDistrict: builder.query<CaseDataByNode, CaseDataByDistrictParameters>({
      async queryFn(arg, _queryApi, _extraOptions, fetchWithBQ) {
        const groups = arg.groups && arg.groups.length > 0 ? `&groups=${arg.groups.join(',')}` : '&groups=total';
        const compartments = arg.compartments ? `&compartments=${arg.compartments.join(',')}` : '';

        // fetch all days
        const secondResult = await fetchWithBQ(`/${arg.node}/?all${groups}${compartments}`);
        // return error if any occurs
        if (secondResult.error) return {error: secondResult.error};

        const result = secondResult.data as CaseDataByNode;
        return {data: result};
      },
    }),

    getCaseDataByDate: builder.query<CaseDataByDate, CaseDataByDateParameters>({
      async queryFn(arg, _queryApi, _extraOptions, fetchWithBQ) {
        const groups = arg.groups && arg.groups.length > 0 ? `&groups=${arg.groups.join(',')}` : '&groups=total';
        const compartments = arg.compartments ? `&compartments=${arg.compartments.join(',')}` : '';

        // fetch all days
        const secondResult = await fetchWithBQ(`/${arg.day}/?all${groups}${compartments}`);
        // return error if any occurs
        if (secondResult.error) return {error: secondResult.error};

        const result = secondResult.data as CaseDataByDate;
        return {data: result};
      },
    }),

    getCaseDataSingleSimulationEntry: builder.query<SimulationDataByNode, CaseDataSingleSimulationEntryParameters>({
      query: (arg: CaseDataSingleSimulationEntryParameters) =>
        `${arg.node}/?all&day=${arg.day}&groups=${
          arg.groups && arg.groups.length > 0 ? arg.groups.join(',') : 'total'
        }`,
    }),
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
