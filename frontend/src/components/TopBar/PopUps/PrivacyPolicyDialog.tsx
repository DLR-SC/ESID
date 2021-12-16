import {Typography} from '@mui/material';
import {useTheme} from '@mui/material/styles';
import React from 'react';

import {useTranslation} from 'react-i18next';
import {Box} from '@mui/system';

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
