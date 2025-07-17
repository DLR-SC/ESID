// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {createContext, useContext, useState, useMemo, useEffect, useCallback} from 'react';
import {useLazySearchArticlesQuery} from 'store/services/articleApi';

export interface Article {
  id: string;
  title: string;
  content: string;
  filename: string;
  file_path: string;
}

interface ArticleDataContextType {
  articles: Article[];
  isLoading: boolean;
  selectedArticle: Article | null;
  setSelectedArticle: (article: Article | null) => void;
  searchArticles: (query: string) => void;
  clearSearch: () => void;
}

const ArticleDataContext = createContext<ArticleDataContextType | undefined>(undefined);

interface ArticleDataProviderProps {
  children: React.ReactNode;
}

/**
 * This context is responsible for fetching and managing article data that is used
 * throughout the application, especially for displaying article content in dialogs or popovers.
 */
export function ArticleDataProvider({children}: ArticleDataProviderProps) {
  const [triggerSearch, {data: searchResults, isLoading}] = useLazySearchArticlesQuery();
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  useEffect(() => {
    if (searchResults) {
      const newArticles: Article[] = searchResults.results.map((item) => ({
        id: item.id.toString(),
        title: `${item.filename} (p. ${item.page_num})`,
        content: item.text_content,
        filename: item.filename,
        file_path: '', // Not available in new API
      }));
      setArticles(newArticles);
    }
  }, [searchResults]);

  const searchArticles = useCallback(
    (query: string) => {
      triggerSearch(query).catch((error) => {
        console.error('Failed to search articles:', error);
      });
    },
    [triggerSearch]
  );

  const clearSearch = useCallback(() => {
    setArticles([]);
  }, []);

  const value = useMemo(
    () => ({
      articles,
      isLoading,
      selectedArticle,
      setSelectedArticle,
      searchArticles,
      clearSearch,
    }),
    [articles, isLoading, selectedArticle, searchArticles, clearSearch]
  );

  return <ArticleDataContext.Provider value={value}>{children}</ArticleDataContext.Provider>;
}

/**
 * Custom hook to easily access the Article data context.
 */
export function useArticleData(): ArticleDataContextType {
  const context = useContext(ArticleDataContext);
  if (context === undefined) {
    throw new Error('useArticleData must be used within an ArticleDataProvider');
  }
  return context;
}
