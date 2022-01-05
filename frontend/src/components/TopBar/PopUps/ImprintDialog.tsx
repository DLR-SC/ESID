import React from 'react';
import {useTheme} from '@mui/material/styles';
import {useTranslation} from 'react-i18next';
import {Box, Typography} from '@mui/material';

/**
 * This component displays the imprint legal text.
 */
export default function ImprintDialog(): JSX.Element {
  const {t} = useTranslation('legal');
  const theme = useTheme();

  return (
    <Box
      sx={{
        padding: theme.spacing(4),
        background: theme.palette.background.paper,
      }}
    >
      <Typography variant='h1'>{t('imprint.header')}</Typography>
      {/* While it says that it is dangerous, it is fine here. Only static content is inserted. */}
      <div dangerouslySetInnerHTML={{__html: t('imprint.content')}} />
    </Box>
  );
}
