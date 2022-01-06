import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
import {RKIDistrictQueryResult, RKIDateQueryResult} from '../../types/rki';

export const rkiApi = createApi({
  reducerPath: 'rkiApi',
  baseQuery: fetchBaseQuery({baseUrl: `${process.env.API_URL || ''}/api/v1/rki/`}),
  endpoints: (builder) => ({
    getAllDatesByDistrict: builder.query<RKIDistrictQueryResult, string>({
      query: (ags) => {
        console.log(`RKI Query: county/${ags}/`);
        return `county/${ags}/`;
      },
    }),
    getAllDistrictsByDate: builder.query<RKIDateQueryResult, string>({
      query: (date) => {
        console.log(`RKI Query: day/${date}/`);
        return `day/${date}/`;
      },
    }),
  }),
});

export const {useGetAllDistrictsByDateQuery, useGetAllDatesByDistrictQuery} = rkiApi;
