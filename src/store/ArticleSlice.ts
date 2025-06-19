// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export interface Article {
  id: number;
  filename: string;
  title: string;
  author?: string;
  organization?: string;
  year_published?: number;
  keywords?: string;
  file_path: string;
}

export interface ArticleState {
  searchQuery: string;
  articles: Article[];
}

const initialState: ArticleState = {
  searchQuery: '',
  articles: [],
};

export const ArticleSlice = createSlice({
  name: 'article',
  initialState,
  reducers: {
    setArticleSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    setArticles(state, action: PayloadAction<Article[]>) {
      state.articles = action.payload;
    },
  },
});

export const {setArticleSearchQuery, setArticles} = ArticleSlice.actions;
export default ArticleSlice.reducer;
