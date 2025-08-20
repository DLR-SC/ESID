// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {useCallback, useMemo} from 'react';
import {Box, Chip, Typography} from '@mui/material';
import {useTranslation} from 'react-i18next';
import {Localization} from 'types/localization';

interface QuerySuggestionsProps {
  /** A list of suggestion strings to display. */
  suggestions: string[];
  /** The function to call when a suggestion chip is clicked. */
  onSuggestionClick: (query: string) => void;
  /** Optional localization settings for the component, including number formatting and language overrides. */
  localization?: Localization;
}

/**
 * A component that displays a list of clickable query suggestion chips.
 */
export default function QuerySuggestions({
  suggestions,
  onSuggestionClick,
  localization,
}: QuerySuggestionsProps): JSX.Element {
  const {t: defaultT, i18n} = useTranslation();

  const memoizedLocalization = useMemo(
    () =>
      localization ?? {
        formatNumber: (v: number) => v.toLocaleString(i18n.language),
        customLang: 'global',
        overrides: {},
      },
    [localization, i18n.language]
  );

  const {t: customT} = useTranslation(memoizedLocalization.customLang);

  const tOverride = useCallback(
    (key: string) =>
      memoizedLocalization.overrides?.[key] ? customT(memoizedLocalization.overrides[key]) : defaultT(key),
    [customT, defaultT, memoizedLocalization.overrides]
  );

  return (
    <Box mb={2}>
      <Typography variant='caption' sx={{color: 'GrayText', mb: 1, display: 'block'}}>
        {tOverride('semanticSearch.suggestions.title')}
      </Typography>
      <Box display='flex' flexWrap='wrap' gap={1}>
        {suggestions.map((suggestion) => (
          <Chip
            key={suggestion}
            label={suggestion}
            onClick={() => onSuggestionClick(suggestion)}
            variant='outlined'
            size='small'
            sx={{
              cursor: 'pointer',
              borderColor: 'primary.light',
              color: 'primary.main',
              '&:hover': {
                backgroundColor: 'primary.main_10', // Assuming a 10% opacity color from your theme
                borderColor: 'primary.main',
              },
            }}
          />
        ))}
      </Box>
    </Box>
  );
}
