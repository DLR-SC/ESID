// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
import {SearchResult} from 'types/semanticSearch';

// Define types for the new API response
export interface ApiSearchResult {
  id: number;
  article_title: string;
  hyperlink: string;
  page_num: number;
  content_type: 'text' | 'image';
  text_content: string;
  similarity: number;
  language: 'en' | 'de';
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
    searchArticles: build.query<SearchResult[], {searchQuery: string; lang: string; token?: string}>({
      query: ({searchQuery, lang, token}) => ({
        url: 'search',
        params: {query: searchQuery, lang: lang},
        headers: token ? {Authorization: `Bearer ${token}`} : {},
      }),
      transformResponse: (response: ApiSearchResponse, _meta, arg) => {
        const lowerCaseQuery = arg.searchQuery.toLowerCase();
        const queryTerms = lowerCaseQuery.split(' ').filter((term) => term.length > 2);

        const newResults: SearchResult[] = response.results.map((item) => {
          const relevanceScore = item.similarity;

          let classification: 'direct' | 'high' | 'related' | 'unrelated';
          if (relevanceScore >= 0.9) {
            classification = 'direct';
          } else if (relevanceScore >= 0.8) {
            classification = 'high';
          } else if (relevanceScore < 0.8 && relevanceScore > 0.0) {
            classification = 'related';
          } else {
            classification = 'unrelated';
          }

          return {
            id: item.id.toString(),
            title: item.article_title,
            hyperlink: item.hyperlink,
            content: item.text_content,
            relevanceScore,
            classification,
            highlightTerms: queryTerms,
            language: item.language,
          };
        });

        newResults.sort((a, b) => b.relevanceScore - a.relevanceScore);
        return newResults;
      },
    }),
  }),
});

export const {useLazySearchArticlesQuery} = articleApi;
