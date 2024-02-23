// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {Dictionary} from 'util/util';
import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
import {GroupFilter, GroupResponse} from 'types/group';

export const groupApi = createApi({
  reducerPath: 'groupApi',
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  baseQuery: fetchBaseQuery({baseUrl: `${import.meta.env.VITE_API_URL || ''}/api/v1/`}),
  endpoints: (builder) => ({
    getGroupCategories: builder.query<GroupCategories, void>({
      query: () => {
        return 'groupcategories/';
      },
    }),

    getGroupSubcategories: builder.query<GroupSubcategories, void>({
      query: () => {
        return 'groups/';
      },
    }),

    getMultipleGroupFilterData: builder.query<Dictionary<GroupResponse>, PostFilter[]>({
      async queryFn(arg, _queryApi, _extraOptions, fetchWithBQ) {
        const result: Dictionary<GroupResponse> = {};
        for (const post of arg) {
          const singleResult = await fetchWithBQ({
            url:
              `simulation/${post.id}/${post.node}/?all` +
              (post.day ? `&day=${post.day}` : '') +
              (post.compartment ? `&compartments=${post.compartment}` : ''),
            method: 'POST',
            body: {groups: post.groupFilter.groups},
          });

          if (singleResult.error) return {error: singleResult.error};

          result[post.groupFilter.name] = singleResult.data as GroupResponse;
        }
        return {data: result};
      },
    }),

    getSingleGroupFilterData: builder.query<GroupResponse, PostFilter>({
      async queryFn(arg, _queryApi, _extraOptions, fetchWithBQ) {
        const result = await fetchWithBQ({
          url:
            `simulation/${arg.id}/${arg.node}/?all` +
            (arg.day ? `&day=${arg.day}` : '') +
            (arg.compartment ? `&compartments=${arg.compartment}` : ''),
          method: 'POST',
          body: {groups: arg.groupFilter.groups},
        });

        if (result.error) return {error: result.error};

        return {data: result.data as GroupResponse};
      },
    }),
  }),
});

export interface PostFilter {
  id: number;
  node: string;
  groupFilter: GroupFilter;
  day?: string;
  compartment?: string;
}

export interface GroupCategory {
  key: string;
  name: string;
  description: string;
}

interface GroupCategories {
  count: number;
  next: null;
  previous: null;
  results: Array<GroupCategory> | null;
}

export interface GroupSubcategory {
  key: string;
  name: string;
  description: string;
  category: string;
}

interface GroupSubcategories {
  count: number;
  next: null;
  previous: null;
  results: Array<GroupSubcategory> | null;
}

export const {
  useGetGroupCategoriesQuery,
  useGetGroupSubcategoriesQuery,
  useGetSingleGroupFilterDataQuery,
  useGetMultipleGroupFilterDataQuery,
} = groupApi;
