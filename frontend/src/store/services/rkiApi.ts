import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
import {RKIDataByDate, RKIDataByNode} from '../../types/rki';
import {SimulationDataByNode} from '../../types/scenario';

export const rkiApi = createApi({
  reducerPath: 'rkiApi',
  baseQuery: fetchBaseQuery({baseUrl: `${process.env.API_URL || ''}/api/v1/rki/`}),
  endpoints: (builder) => ({
    getRkiByDistrict: builder.query<RKIDataByNode, RKIDataByDistrictParameters>({
      async queryFn(arg, _queryApi, _extraOptions, fetchWithBQ) {
        const groups = (arg.groups && arg.groups.length > 0) ? `&groups=${arg.groups.join(',')}` : '&groups=total';
        const compartments = arg.compartments ? `&compartments=${arg.compartments.join(',')}` : '';

        // fetch all days
        const secondResult = await fetchWithBQ(`/${arg.node}/?all${groups}${compartments}`);
        // return error if any occurs
        if (secondResult.error) return {error: secondResult.error};

        const result = secondResult.data as RKIDataByNode;
        return {data: result};
      },
    }),

    getRkiByDate: builder.query<RKIDataByDate, RKIDataByDateParameters>({
      async queryFn(arg, _queryApi, _extraOptions, fetchWithBQ) {
        const groups = (arg.groups && arg.groups.length > 0) ? `&groups=${arg.groups.join(',')}` : '&groups=total';
        const compartments = arg.compartments ? `&compartments=${arg.compartments.join(',')}` : '';

        // fetch all days
        const secondResult = await fetchWithBQ(`/${arg.day}/?all${groups}${compartments}`);
        // return error if any occurs
        if (secondResult.error) return {error: secondResult.error};

        const result = secondResult.data as RKIDataByDate;
        return {data: result};
      },
    }),

    getRkiSingleSimulationEntry: builder.query<SimulationDataByNode, RKISingleSimulationEntryParameters>({
      query: (arg: RKISingleSimulationEntryParameters) => `${arg.node}/?all&day=${arg.day}&groups=${(arg.groups && arg.groups.length > 0) ? arg.groups.join(',') : 'total'}`,
    }),
  }),
});

interface RKIDataByDistrictParameters {
  node: string;
  groups: Array<string> | null;
  compartments: Array<string> | null;
}

interface RKIDataByDateParameters {
  day: string;
  groups: Array<string> | null;
  compartments: Array<string> | null;
}

interface RKISingleSimulationEntryParameters {
  node: string;
  day: string;
  groups: Array<string> | null;
}

export const {useGetRkiByDateQuery, useGetRkiByDistrictQuery, useGetRkiSingleSimulationEntryQuery} = rkiApi;
