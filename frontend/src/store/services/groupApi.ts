import {Dictionary} from 'util/util';
import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
import {filter, groupResponse} from 'types/group';

export const groupApi = createApi({
  reducerPath: 'groupApi',
  baseQuery: fetchBaseQuery({baseUrl: `${process.env.API_URL || ''}/api/v1/`}),
  endpoints: (builder) => ({
    getGroupCategories: builder.query<groupCategories, void>({
      query: () => {
        return 'groupcategories/';
      },
    }),

    getGroupSubcategories: builder.query<groupSubcategories, void>({
      query: () => {
        return 'groups/';
      },
    }),

    getMultipleFilterData: builder.query<Dictionary<groupResponse>, postFilter[]>({
      async queryFn(arg, _queryApi, _extraOptions, fetchWithBQ) {
        const result: Dictionary<groupResponse> = {};
        for (const post of arg) {
          const singleResult = await fetchWithBQ({
            url:
              `simulation/${post.id}/${post.node}/?all` +
              (post.day ? `&day=${post.day}` : '') +
              (post.compartment ? `&compartments=${post.compartment}` : ''),
            method: 'POST',
            body: {groups: post.filter.groups},
          });

          if (singleResult.error) return {error: singleResult.error};

          result[post.filter.name] = singleResult.data as groupResponse;
        }
        return {data: result};
      },
    }),
  }),
});

export interface postFilter {
  id: number;
  node: string;
  filter: filter;
  day?: string;
  compartment?: string;
}

export interface groupCategory {
  key: string;
  name: string;
  description: string;
}

interface groupCategories {
  count: number;
  next: null;
  previous: null;
  results: Array<groupCategory> | null;
}

export interface groupSubcategory {
  key: string;
  name: string;
  description: string;
  category: string;
}

interface groupSubcategories {
  count: number;
  next: null;
  previous: null;
  results: Array<groupSubcategory> | null;
}

export const {useGetGroupCategoriesQuery, useGetGroupSubcategoriesQuery, useGetMultipleFilterDataQuery} = groupApi;
