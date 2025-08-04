// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {useState} from 'react';
import {Box, Typography, Divider, TextField, IconButton, InputAdornment, CircularProgress} from '@mui/material';
import {useSemanticSearch} from 'context/SemanticSearchContext';
import QuerySuggestions from './QuerySuggestions';
import {useTranslation} from 'react-i18next';
import SearchIcon from '@mui/icons-material/Search';
import {useAppDispatch, useAppSelector} from 'store/hooks';
import {setSemanticSearchQuery} from 'store/SemanticSearchSlice';
import SearchResultsList from './SearchResultsList';
import ArticleDialog from './ArticleDialog';
import {SearchResult} from 'types/semanticSearch';

/**
 * Main container for the Semantic Search feature.
 * It will manage the search state and orchestrate the child components.
 */
export default function SemanticSearchContainer(): JSX.Element {
  const {searchResults, isLoading, performSearch, clearSearch} = useSemanticSearch();
  const dispatch = useAppDispatch();
  const query = useAppSelector((state) => state.semanticSearch.searchQuery);
  const searchStatus = useAppSelector((state) => state.semanticSearch.searchStatus);
  const {t} = useTranslation('global');
  const [selectedArticle, setSelectedArticle] = useState<SearchResult | null>(null);

  const suggestions = [t('semanticSearch.suggestions.scenarioForecasting'), t('semanticSearch.suggestions.purpose')];

  const handleSearch = () => {
    // performSearch is now required and will not be undefined.
    if (performSearch) {
      performSearch(query);
    }
  };

  const handleClear = () => {
    dispatch(setSemanticSearchQuery(''));
    clearSearch();
  };

  const handleSuggestionClick = (suggestion: string) => {
    dispatch(setSemanticSearchQuery(suggestion));
    if (performSearch) {
      performSearch(suggestion);
    }
  };

  const handleResultClick = (article: SearchResult) => {
    setSelectedArticle(article);
  };

  const handleCloseDialog = () => {
    setSelectedArticle(null);
  };

  return (
    <Box mt={4}>
      <Divider sx={{mb: 3}} />
      <Typography variant='h2' gutterBottom>
        {t('semanticSearch.title')}
      </Typography>
      <Typography variant='body1' paragraph sx={{color: 'GrayText'}}>
        {t('semanticSearch.description')}
      </Typography>

      <TextField
        fullWidth
        size='small'
        variant='outlined'
        placeholder={t('semanticSearch.placeholder')}
        value={query}
        onChange={(e) => dispatch(setSemanticSearchQuery(e.target.value))}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSearch();
          } else if (e.key === 'Escape') {
            handleClear();
          }
        }}
        InputProps={{
          sx: {
            paddingRight: '4px',
          },
          endAdornment: (
            <InputAdornment position='end'>
              <IconButton
                onClick={handleSearch}
                disabled={isLoading}
                sx={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '4px',
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                  '&.Mui-disabled': {
                    backgroundColor: 'action.disabledBackground',
                  },
                }}
              >
                {isLoading ? <CircularProgress size={24} color='inherit' /> : <SearchIcon sx={{fontSize: '16px'}} />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <QuerySuggestions suggestions={suggestions} onSuggestionClick={handleSuggestionClick} />

      <Box
        mt={3}
        sx={{
          maxHeight: '450px',
          overflowY: 'auto',
          p: '2px',
        }}
      >
        {searchResults.length > 0 && (
          <Typography variant='body2' sx={{color: 'GrayText', mb: 1.5, px: 1}}>
            {t(
              searchResults.length === 1
                ? 'semanticSearch.results.resultsFound_one'
                : 'semanticSearch.results.resultsFound_other',
              {count: searchResults.length}
            )}{' '}
            &quot;
            <Box component='span' sx={{fontStyle: 'italic', color: 'primary.main'}}>
              {query}
            </Box>
            &quot;
          </Typography>
        )}
        {isLoading ? (
          <Box display='flex' justifyContent='center' alignItems='center' sx={{py: 4}}>
            <CircularProgress />
          </Box>
        ) : searchResults.length > 0 ? (
          <SearchResultsList results={searchResults} onResultClick={handleResultClick} />
        ) : searchStatus === 'succeeded' ? (
          <Box display='flex' justifyContent='center' alignItems='center' sx={{py: 4}}>
            <Typography sx={{color: 'GrayText'}}>{t('semanticSearch.results.noResults')}</Typography>
          </Box>
        ) : null}
      </Box>

      <ArticleDialog open={selectedArticle !== null} onClose={handleCloseDialog} article={selectedArticle} />
    </Box>
  );
}
