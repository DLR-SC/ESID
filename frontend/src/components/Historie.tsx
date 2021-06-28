import React from 'react';
import {Typography} from '@material-ui/core';
import {useTranslation} from 'react-i18next';

import {makeStyles} from '@material-ui/core';

const useStyles = makeStyles({
  HistorieTitleStyle: {
    paddingTop: '20px',
  },
});

export default function ResearchBar(): JSX.Element {
  const classes = useStyles();
  const {t} = useTranslation();

  return <Typography className={classes.HistorieTitleStyle}>{t('Historie.placeholder')}</Typography>;
}
