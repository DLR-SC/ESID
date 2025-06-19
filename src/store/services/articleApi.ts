// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
import {Article} from 'store/ArticleSlice';

export const articleApi = createApi({
  reducerPath: 'articleApi',
  // Point to our new backend API.
  // The '/api' prefix will be handled by the Vite proxy in development.
  baseQuery: fetchBaseQuery({baseUrl: '/api'}),
  endpoints: (build) => ({
    searchArticles: build.query<Article[], string>({
      // The query parameter is now 'search', matching our FastAPI endpoint.
      query: (searchQuery) => `articles?search=${searchQuery}`,
      // No need for a transformResponse, as our API now returns data
      // in the exact format the frontend expects.
    }),
  }),
});

export const {useLazySearchArticlesQuery} = articleApi;
