import { Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React from 'react';

import {useTranslation} from 'react-i18next';

const useStyles = makeStyles({
  dialogStyle: {
    padding: '20px',
    background: '#f8f8f8',
  },
});

/**
 * This component displays the accessibility legal text.
 */
export default function AccessibilityDialog(): JSX.Element {
  const {t} = useTranslation('legal');
  const classes = useStyles();

  return (
    <div className={classes.dialogStyle}>
      <Typography variant='h3'>{t('accessibility.header')}</Typography>
      {/* While it says that it is dangerous, it is fine here. Only static content is inserted. */}
      <div dangerouslySetInnerHTML={{__html: t('accessibility.content')}} />
    </div>
  );
}
