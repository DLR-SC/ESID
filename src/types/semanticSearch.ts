// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

/**
 * Defines the structure of a processed search result object used by the UI.
 */
export interface SearchResult {
  id: string;
  title: string;
  hyperlink: string;
  content: string;
  relevanceScore: number;
  classification: 'direct' | 'high' | 'related';
  highlightTerms: string[];
  language: 'en' | 'de';
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
