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
          label={`${result.relevanceScore}% match`}
          size='small'
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`,
            color: 'white',
            fontWeight: 600,
            fontSize: '10px',
            ml: 1.5,
          }}
        />
      </Box>

      <Typography variant='body2' sx={{color: 'GrayText', mb: 1.5}}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
        magna aliqua.
      </Typography>

      <Box display='flex' justifyContent='space-between' alignItems='center'>
        <Box display='flex' gap={1}>
          {result.keywords?.split(',').map((tag) => (
            <Chip
              key={tag}
              label={tag.trim()}
              size='small'
              sx={{
                backgroundColor: 'primary.main_10',
                color: 'primary.main',
                fontSize: '10px',
                fontWeight: 500,
              }}
            />
          ))}
        </Box>
        <Chip
          label={classificationText[result.classification]}
          size='small'
          variant='outlined'
          sx={{
            ...classificationStyles[result.classification],
            fontWeight: 600,
            fontSize: '10px',
            height: '24px',
          }}
        />
      </Box>
    </Paper>
  );
}
