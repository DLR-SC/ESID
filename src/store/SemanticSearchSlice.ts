// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {createSlice, PayloadAction} from '@reduxjs/toolkit';

/** The status of the semantic search, to distinguish between initial, loading, and completed states. */
export type SearchStatus = 'idle' | 'loading' | 'succeeded';

interface SemanticSearchState {
  searchQuery: string;
  searchStatus: SearchStatus;
}

const initialState: SemanticSearchState = {
  searchQuery: '',
  searchStatus: 'idle',
};

const semanticSearchSlice = createSlice({
  name: 'semanticSearch',
  initialState,
  reducers: {
    setSemanticSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setSemanticSearchStatus: (state, action: PayloadAction<SearchStatus>) => {
      state.searchStatus = action.payload;
    },
    resetSemanticSearch: () => initialState,
  },
});

export const {setSemanticSearchQuery, setSemanticSearchStatus, resetSemanticSearch} = semanticSearchSlice.actions;

export default semanticSearchSlice.reducer;
