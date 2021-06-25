import React from 'react';

import {useTranslation} from 'react-i18next';
import {makeStyles, Typography} from '@material-ui/core';

const useStyles = makeStyles({
  dialogStyle: {
    padding: '20px',
    background: '#f8f8f8',
  },
});

/**
 * This component displays the privacy policy legal text.
 */
export default function PrivacyPolicyDialog(): JSX.Element {
  const {t} = useTranslation('legal');
  const classes = useStyles();

  return (
    <div className={classes.dialogStyle}>
      <Typography variant='h3'>{t('privacy-policy.header')}</Typography>
      {/* While it says that it is dangerous, it is fine here. Only static content is inserted. */}
      <div dangerouslySetInnerHTML={{__html: t('privacy-policy.content')}} />
    </div>
  );
}
