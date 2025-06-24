// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {createContext, useContext, useState, useMemo, useCallback} from 'react';
import {useLazySearchArticlesQuery} from 'store/services/articleApi';
import {SearchResult, SemanticSearchContextType} from 'types/semanticSearch';
import {Article} from 'store/ArticleSlice';
import {useAppDispatch, useAppSelector} from 'store/hooks';
import {setSemanticSearchStatus, resetSemanticSearch} from 'store/SemanticSearchSlice';

const SemanticSearchContext = createContext<SemanticSearchContextType | undefined>(undefined);

interface SemanticSearchProviderProps {
  children: React.ReactNode;
}

/**
 * Provides a "Data Socket" for the semantic search feature.
 * It uses the existing lazy query to fetch articles on-demand and then
 * simulates the semantic search results on the client-side.
 */
export function SemanticSearchProvider({children}: SemanticSearchProviderProps) {
  const [triggerSearch, {isLoading}] = useLazySearchArticlesQuery();
  const [augmentedResults, setAugmentedResults] = useState<SearchResult[]>([]);
  const dispatch = useAppDispatch();

  const searchStatus = useAppSelector((state) => state.semanticSearch.searchStatus);

  const performSearch = useCallback(
    (query: string) => {
      if (!query || query.trim() === '') {
        setAugmentedResults([]);
        dispatch(setSemanticSearchStatus('idle'));
        return;
      }

      dispatch(setSemanticSearchStatus('loading'));
      setTimeout(() => {
        triggerSearch(query)
          .unwrap()
          .then((fetchedArticles) => {
            const lowerCaseQuery = query.toLowerCase();
            const queryTerms = lowerCaseQuery.split(' ').filter((term) => term.length > 2);

            const newResults: SearchResult[] = fetchedArticles.map((article: Article) => {
              let relevanceScore = Math.floor(Math.random() * 40) + 60;
              if (article.title.toLowerCase().includes(lowerCaseQuery)) {
                relevanceScore = Math.min(99, relevanceScore + 15);
              }

              let classification: 'direct' | 'high' | 'related';
              if (relevanceScore >= 90) {
                classification = 'direct';
              } else if (relevanceScore >= 80) {
                classification = 'high';
              } else {
                classification = 'related';
              }

              return {
                ...article,
                relevanceScore,
                classification,
                highlightTerms: queryTerms,
              };
            });

            newResults.sort((a, b) => b.relevanceScore - a.relevanceScore);
            setAugmentedResults(newResults);
            dispatch(setSemanticSearchStatus('succeeded'));
          })
          .catch((err) => {
            console.error('Semantic search failed:', err);
            dispatch(setSemanticSearchStatus('idle'));
          });
      }, 0);
    },
    [dispatch, triggerSearch]
  );

  const clearSearch = useCallback(() => {
    dispatch(resetSemanticSearch());
    setAugmentedResults([]);
  }, [dispatch]);

  const value = useMemo(
    () => ({
      searchResults: augmentedResults,
      isLoading: searchStatus === 'loading' || isLoading,
      performSearch,
      clearSearch,
    }),
    [augmentedResults, searchStatus, isLoading, performSearch, clearSearch]
  );

  return <SemanticSearchContext.Provider value={value}>{children}</SemanticSearchContext.Provider>;
}

/**
 * Custom hook to easily access the Semantic Search context.
 */
export function useSemanticSearch(): SemanticSearchContextType {
  const context = useContext(SemanticSearchContext);
  if (context === undefined) {
    throw new Error('useSemanticSearch must be used within a SemanticSearchProvider');
  }
  return context;
}
