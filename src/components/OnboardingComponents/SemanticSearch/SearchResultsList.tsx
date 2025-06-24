// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import {Box} from '@mui/material';
import {SearchResult} from 'types/semanticSearch';
import SearchResultItem from './SearchResultItem';

interface SearchResultsListProps {
  results: SearchResult[];
  onResultClick: (result: SearchResult) => void;
}

/**
 * Renders a list of search result items.
 */
export default function SearchResultsList({results, onResultClick}: SearchResultsListProps): JSX.Element {
  return (
    <Box mt={2}>
      {results.map((result, index) => (
        <SearchResultItem key={result.id + index} result={result} onResultClick={onResultClick} />
      ))}
    </Box>
  );
}
