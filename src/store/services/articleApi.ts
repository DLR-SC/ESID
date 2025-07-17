// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
import {RootState} from '..';

// Define types for the new API response
export interface ApiSearchResult {
  id: number;
  filename: string;
  page_num: number;
  content_type: 'text' | 'image';
  text_content: string;
  similarity: number;
}

export interface ApiSearchResponse {
  query: string;
  results: ApiSearchResult[];
}

console.log('VITE_ARTICLE_API_URL:', import.meta.env.VITE_ARTICLE_API_URL);

export const articleApi = createApi({
  reducerPath: 'articleApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_ARTICLE_API_URL || ''}`,
    prepareHeaders: (headers, {getState}) => {
      const realm = (getState() as RootState).realm;
      const auth = (getState() as RootState).auth;

      if (realm.name && realm.name !== '') {
        headers.set('x-realm', realm.name);
      }

      if (auth.token && auth.token !== '') {
        // headers.set('Authorization', 'Bearer ' + auth.token);
      }
      headers.set('Authorization', 'Bearer ' + 'TODO');

      return headers;
    },
  }),
  endpoints: (build) => ({
    searchArticles: build.query<ApiSearchResponse, string>({
      query: (searchQuery) => ({
        url: 'search',
        params: {query: searchQuery},
      }),
    }),
  }),
});

export const {useLazySearchArticlesQuery} = articleApi;
