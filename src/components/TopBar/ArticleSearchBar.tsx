// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {useState, SyntheticEvent} from 'react';
import {useTranslation} from 'react-i18next';
import {useAppDispatch, useAppSelector} from 'store/hooks';
import {setArticleSearchQuery} from 'store/ArticleSlice';
import {useArticleData} from '@/context/ArticleDataContext';

import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Autocomplete from '@mui/material/Autocomplete';
import useTheme from '@mui/material/styles/useTheme';
import SearchIcon from '@mui/icons-material/Search';
import CircularProgress from '@mui/material/CircularProgress';

import {Article} from 'store/ArticleSlice';

interface ArticleSearchBarProps {
  selectedArticle: Article | null;
  onChange: (event: SyntheticEvent<Element, Event>, value: Article | null) => void;
  placeholder?: string;
}

export default function ArticleSearchBar({selectedArticle, onChange, placeholder}: ArticleSearchBarProps): JSX.Element {
  const theme = useTheme();
  const {t} = useTranslation();
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);

  // Consume the context to get data and loading state
  const {articles, isLoading} = useArticleData();
  const searchQuery = useAppSelector((state) => state.article.searchQuery);

  const handleInputChange = (_event: React.SyntheticEvent, newInputValue: string) => {
    dispatch(setArticleSearchQuery(newInputValue));
  };

  return (
    <Container maxWidth='md' sx={{flexGrow: 1, mx: 2}}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          alignContent: 'center',
          width: 1,
          borderRadius: 4,
          background: theme.palette.background.default,
          borderStyle: 'solid',
          borderWidth: '2px',
          borderColor: theme.palette.divider,
          '&:hover': {borderColor: theme.palette.primary.light},
          '&:hover *': {borderColor: theme.palette.primary.light},
          '&:focus-within': {borderColor: theme.palette.primary.main},
          '&:focus-within *': {borderColor: theme.palette.primary.main},
        }}
      >
        <SearchIcon
          color='primary'
          sx={{
            pl: 2,
            pr: 1,
          }}
        />
        <Autocomplete
          open={open}
          onOpen={() => setOpen(true)}
          onClose={() => setOpen(false)}
          value={selectedArticle}
          onChange={onChange}
          inputValue={searchQuery}
          onInputChange={handleInputChange}
          options={articles}
          loading={isLoading}
          getOptionLabel={(option) => option.title}
          sx={{
            flexGrow: 1,
            '& *:focus': {outline: 'none'},
          }}
          renderInput={(params) => (
            <div ref={params.InputProps.ref} style={{display: 'flex', alignItems: 'center'}}>
              <input
                type='search'
                {...params.inputProps}
                style={{
                  flexGrow: 1,
                  borderStyle: 'none',
                  fontSize: '16px',
                  padding: '5px',
                  borderTopRightRadius: 26,
                  borderBottomRightRadius: 26,
                }}
                placeholder={placeholder || t('search.articles.placeholder')}
                aria-label={t('search.articles.ariaLabel')}
              />
              {isLoading && <CircularProgress color='inherit' size={20} sx={{mr: 1}} />}
            </div>
          )}
        />
      </Box>
    </Container>
  );
}
