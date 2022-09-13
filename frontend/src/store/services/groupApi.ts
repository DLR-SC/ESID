import {Dictionary} from 'util/util';
import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
import {groupResponse} from 'types/group';

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

    getGroupData: builder.mutation<groupResponse, post>({
      query: (arg: post) => ({
        url: `simulation/${arg.id}/${arg.node}/?all`,
        method: 'POST',
        body: arg.postGroup,
      }),
    }),
  }),
});

export interface post {
  id: number;
  node: string;
  postGroup: Dictionary<Dictionary<string[]>>;
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

export const {useGetGroupCategoriesQuery, useGetGroupSubcategoriesQuery, useGetGroupDataMutation} = groupApi;
