// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {createContext, useContext, useState, useMemo, useCallback} from 'react';
import {useLazySearchArticlesQuery} from 'store/services/articleApi';
import {SearchResult, SemanticSearchContextType} from 'types/semanticSearch';
import i18n from 'util/i18n';
import {useAppSelector} from 'store/hooks';

const SemanticSearchContext = createContext<SemanticSearchContextType | undefined>(undefined);

interface SemanticSearchProviderProps {
  children: React.ReactNode;
}

export function SemanticSearchProvider({children}: SemanticSearchProviderProps) {
  const [triggerSearch, {isLoading}] = useLazySearchArticlesQuery();
  const [augmentedResults, setAugmentedResults] = useState<SearchResult[]>([]);
  const [searchStatus, setSearchStatus] = useState<'idle' | 'loading' | 'succeeded'>('idle');
  const token = useAppSelector((state) => state.auth.token);

  const performSearch = useCallback(
    (query: string) => {
      if (!query || query.trim() === '') {
        setAugmentedResults([]);
        setSearchStatus('idle');
        return;
      }

      setSearchStatus('loading');
      triggerSearch({searchQuery: query, lang: i18n.language, token})
        .unwrap()
        .then((transformedResults) => {
          setAugmentedResults(transformedResults);
          setSearchStatus('succeeded');
        })
        .catch((err) => {
          console.error('Semantic search failed:', err);
          setSearchStatus('idle');
        });
    },
    [triggerSearch, token]
  );

  const clearSearch = useCallback(() => {
    setAugmentedResults([]);
    setSearchStatus('idle');
  }, []);

  const value = useMemo(
    () => ({
      searchResults: augmentedResults,
      isLoading: searchStatus === 'loading' || isLoading,
      searchStatus,
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
