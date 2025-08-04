// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {createContext, useContext, useState, useMemo, useCallback} from 'react';
import {useLazySearchArticlesQuery} from 'store/services/articleApi';
import {SearchResult, SemanticSearchContextType} from 'types/semanticSearch';
import {useAppDispatch, useAppSelector} from 'store/hooks';
import {setSemanticSearchStatus, resetSemanticSearch} from 'store/SemanticSearchSlice';
import i18n from 'util/i18n';

const SemanticSearchContext = createContext<SemanticSearchContextType | undefined>(undefined);

interface SemanticSearchProviderProps {
  children: React.ReactNode;
}

export function SemanticSearchProvider({children}: SemanticSearchProviderProps) {
  const [triggerSearch, {isLoading}] = useLazySearchArticlesQuery();
  const [augmentedResults, setAugmentedResults] = useState<SearchResult[]>([]);
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);

  const searchStatus = useAppSelector((state) => state.semanticSearch.searchStatus);

  const performSearch = useCallback(
    (query: string) => {
      if (!query || query.trim() === '') {
        setAugmentedResults([]);
        dispatch(setSemanticSearchStatus('idle'));
        return;
      }

      dispatch(setSemanticSearchStatus('loading'));
      triggerSearch({searchQuery: query, lang: i18n.language, token})
        .unwrap()
        .then((apiResponse) => {
          const lowerCaseQuery = query.toLowerCase();
          const queryTerms = lowerCaseQuery.split(' ').filter((term) => term.length > 2);

          const newResults: SearchResult[] = apiResponse.results.map((item) => {
            const relevanceScore = Math.round(item.similarity * 100);

            let classification: 'direct' | 'high' | 'related';
            if (relevanceScore >= 90) {
              classification = 'direct';
            } else if (relevanceScore >= 80) {
              classification = 'high';
            } else {
              classification = 'related';
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
          setAugmentedResults(newResults);
          dispatch(setSemanticSearchStatus('succeeded'));
        })
        .catch((err) => {
          console.error('Semantic search failed:', err);
          dispatch(setSemanticSearchStatus('idle'));
        });
    },
    [dispatch, triggerSearch, token]
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
