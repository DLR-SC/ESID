// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';

// Define types for the new API response
export interface ApiSearchResult {
  id: number;
  article_title: string;
  hyperlink: string;
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
  }),
  endpoints: (build) => ({
    searchArticles: build.query<ApiSearchResponse, {searchQuery: string; lang: string; token?: string}>({
      query: ({searchQuery, lang, token}) => ({
        url: 'search',
        params: {query: searchQuery, lang: lang},
        headers: token ? {Authorization: `Bearer ${token}`} : {},
      }),
    }),
  }),
});

export const {useLazySearchArticlesQuery} = articleApi;
