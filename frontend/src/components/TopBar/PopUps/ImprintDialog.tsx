import {makeStyles} from '@mui/styles';
import React from 'react';

import {useTranslation} from 'react-i18next';
import {Typography} from '@mui/material';

const useStyles = makeStyles({
  dialogStyle: {
    padding: '20px',
    background: '#f8f8f8',
  },
});

/**
 * This component displays the imprint legal text.
 */
export default function ImprintDialog(): JSX.Element {
  const {t} = useTranslation('legal');
  const classes = useStyles();

  return (
    <div className={classes.dialogStyle}>
      <Typography variant='h3'>{t('imprint.header')}</Typography>
      {/* While it says that it is dangerous, it is fine here. Only static content is inserted. */}
      <div dangerouslySetInnerHTML={{__html: t('imprint.content')}} />
    </div>
  );
}
