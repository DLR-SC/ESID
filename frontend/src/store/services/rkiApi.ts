import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
import {RKIDistrictQueryResult, RKIDateQueryResult} from '../../types/rki';

export const rkiApi = createApi({
  reducerPath: 'rkiApi',
  baseQuery: fetchBaseQuery({baseUrl: `${process.env.API_URL || ''}/api/v1/rki/`}),
  endpoints: (builder) => ({
    getRkiByDistrict: builder.query<RKIDistrictQueryResult, RKIDataByDistrictParameters>({
      async queryFn(arg, _queryApi, _extraOptions, fetchWithBQ) {
        const group = arg.group || 'total';
        const compartments = arg.compartments ? `&compartments=${arg.compartments.join(',')}` : '';
        const url = (limit: number, offset: number) =>
          `/${arg.node}/${group}/?limit=${limit}&offset=${offset}${compartments}`;

        // fetch the first entry to get the total count
        const firstResult = await fetchWithBQ(url(1, 0));
        // return error if any occurs
        if (firstResult.error) return {error: firstResult.error};

        const firstData = firstResult.data as RKIDistrictQueryResult;

        // fetch all days
        const secondResult = await fetchWithBQ(url(firstData.count, 0));
        // return error if any occurs
        if (secondResult.error) return {error: secondResult.error};

        const result = secondResult.data as RKIDistrictQueryResult;
        return {data: result};
      },
    }),

    getRkiByDate: builder.query<RKIDateQueryResult, RKIDataByDateParameters>({
      async queryFn(arg, _queryApi, _extraOptions, fetchWithBQ) {
        const group = arg.group || 'total';
        const compartments = arg.compartments ? `&compartments=${arg.compartments.join(',')}` : '';
        const url = (limit: number, offset: number) =>
          `/${arg.day}/${group}/?limit=${limit}&offset=${offset}${compartments}`;

        // fetch the first entry to get the total count
        const firstResult = await fetchWithBQ(url(1, 0));
        // return error if any occurs
        if (firstResult.error) return {error: firstResult.error};

        const firstData = firstResult.data as RKIDateQueryResult;

        // fetch all days
        const secondResult = await fetchWithBQ(url(firstData.count, 0));
        // return error if any occurs
        if (secondResult.error) return {error: secondResult.error};

        const result = secondResult.data as RKIDateQueryResult;
        return {data: result};
      },
    }),
  }),
});

interface RKIDataByDistrictParameters {
  node: string;
  group: string | null;
  compartments: Array<string> | null;
}

interface RKIDataByDateParameters {
  day: string;
  group: string | null;
  compartments: Array<string> | null;
}

export const {useGetRkiByDateQuery, useGetRkiByDistrictQuery} = rkiApi;
