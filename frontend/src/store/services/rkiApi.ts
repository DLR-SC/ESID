import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';

export const rkiApi = createApi({
  reducerPath: 'rkiApi',
  baseQuery: fetchBaseQuery({baseUrl: `${process.env.API_URL || ''}/api/v1/rki/`}),
  endpoints: (builder) => ({
    getAllDatesByDistrict: builder.query<RKIDistrictEntryResult, string>({
      query: (ags) => `county/${ags}/`,
    }),
    getAllDistrictsByDate: builder.query<RKIDateQueryResult, string>({
      query: (date) => `day/${date}/`,
    }),
  }),
});

export const {useGetAllDistrictsByDateQuery, useGetAllDatesByDistrictQuery} = rkiApi;