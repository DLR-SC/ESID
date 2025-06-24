// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {Article} from 'store/ArticleSlice';

/**
 * Extends the base Article type with additional fields for semantic search results.
 */
export interface SearchResult extends Article {
  relevanceScore: number;
  classification: 'direct' | 'high' | 'related';
  highlightTerms: string[];
}

/**
 * Defines the shape of the data and functions provided by the SemanticSearchContext.
 */
export interface SemanticSearchContextType {
  searchResults: SearchResult[];
  isLoading: boolean;
  performSearch: (query: string) => void;
  clearSearch: () => void;
}
