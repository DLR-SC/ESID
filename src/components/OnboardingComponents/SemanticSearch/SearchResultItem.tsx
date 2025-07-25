// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import {Box, Chip, Paper, Typography, useTheme} from '@mui/material';
import {SearchResult} from 'types/semanticSearch';
import {useTranslation} from 'react-i18next';

interface SearchResultItemProps {
  result: SearchResult;
  onResultClick: (result: SearchResult) => void;
}

/**
 * A component that displays a single, styled search result item,
 * including title, snippet, relevance score, and classification tags.
 */
export default function SearchResultItem({result, onResultClick}: SearchResultItemProps): JSX.Element {
  const theme = useTheme();
  const {t} = useTranslation('global');

  const classificationStyles = {
    direct: {
      backgroundColor: 'rgba(76, 175, 80, 0.1)',
      color: '#2e7d32',
      borderColor: 'rgba(76, 175, 80, 0.3)',
    },
    high: {
      backgroundColor: 'rgba(33, 150, 243, 0.1)',
      color: theme.palette.info.dark,
      borderColor: 'rgba(33, 150, 243, 0.3)',
    },
    related: {
      backgroundColor: 'rgba(158, 158, 158, 0.1)',
      color: theme.palette.text.secondary,
      borderColor: 'rgba(158, 158, 158, 0.3)',
    },
  };

  const classificationText = {
    direct: t('semanticSearch.classification.direct'),
    high: t('semanticSearch.classification.high'),
    related: t('semanticSearch.classification.related'),
  };

  const truncateText = (text: string, wordLimit: number) => {
    const words = text.split(' ');
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(' ') + '...';
    }
    return text;
  };

  return (
    <Paper
      onClick={() => onResultClick(result)}
      elevation={1}
      sx={{
        p: 2,
        mb: 2,
        cursor: 'pointer',
        border: '1px solid',
        borderColor: 'divider',
        '&:hover': {
          borderColor: 'primary.main',
          boxShadow: '0 2px 8px rgba(84, 60, 240, 0.1)',
        },
      }}
    >
      <Box display='flex' justifyContent='space-between' alignItems='flex-start' mb={1}>
        <Typography variant='h3' gutterBottom sx={{mb: 0}}>
          {result.title}
        </Typography>
        <Chip
          label={classificationText[result.classification]}
          size='small'
          variant='outlined'
          sx={{
            ...classificationStyles[result.classification],
            fontWeight: 600,
            fontSize: '10px',
            height: '24px',
            ml: 3,
          }}
        />
      </Box>

      <Typography variant='body2' sx={{color: 'GrayText'}}>
        {truncateText(result.content, 50)}
      </Typography>
    </Paper>
  );
}
