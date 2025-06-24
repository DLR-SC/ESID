// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {createContext, useContext, useEffect, ReactNode} from 'react';
import {useAppDispatch, useAppSelector} from 'store/hooks';
import {useLazySearchArticlesQuery} from 'store/services/articleApi';
import {setArticles, Article} from 'store/ArticleSlice';

interface ArticleDataContextType {
  articles: Article[];
  isLoading: boolean;
}

const ArticleDataContext = createContext<ArticleDataContextType | undefined>(undefined);

export const ArticleDataProvider: React.FC<{children: ReactNode}> = ({children}) => {
  const dispatch = useAppDispatch();
  const searchQuery = useAppSelector((state) => state.article.searchQuery);
  const articles = useAppSelector((state) => state.article.articles);

  const [triggerSearch, {data: searchResults, isLoading}] = useLazySearchArticlesQuery();

  useEffect(() => {
    if (searchQuery) {
      void triggerSearch(searchQuery);
    } else {
      dispatch(setArticles([]));
    }
  }, [searchQuery, triggerSearch, dispatch]);

  useEffect(() => {
    if (searchResults) {
      dispatch(setArticles(searchResults));
    }
  }, [searchResults, dispatch]);

  const value = {
    articles,
    isLoading,
  };

  return <ArticleDataContext.Provider value={value}>{children}</ArticleDataContext.Provider>;
};

export const useArticleData = (): ArticleDataContextType => {
  const context = useContext(ArticleDataContext);
  if (context === undefined) {
    throw new Error('useArticleData must be used within an ArticleDataProvider');
  }
  return context;
};
