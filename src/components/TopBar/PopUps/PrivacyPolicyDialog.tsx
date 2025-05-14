// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import Typography from '@mui/material/Typography';
import {useTheme} from '@mui/material/styles';
import React from 'react';

import {useTranslation} from 'react-i18next';
import Box from '@mui/material/Box';

/**
 * This component displays the privacy policy legal text.
 */
export default function PrivacyPolicyDialog(): JSX.Element {
  const {t} = useTranslation('legal');
  const theme = useTheme();

  return (
    <Box
      sx={{
        padding: theme.spacing(4),
        background: theme.palette.background.paper,
      }}
    >
      <Typography variant='h1'>{t('privacy-policy.header')}</Typography>
      {/* While it says that it is dangerous, it is fine here. Only static content is inserted. */}
      <div dangerouslySetInnerHTML={{__html: t('privacy-policy.content')}} />
    </Box>
  );
}
