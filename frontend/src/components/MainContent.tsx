import {Grid, makeStyles, Typography} from '@material-ui/core';
import React from 'react';
import {useTranslation} from 'react-i18next';

const useStyles = makeStyles({
  mainContent: {
    width: '100%',
    height: '100%',
  },
});

/**
 * This is currently a placeholder. It will contain the scenario cards and graphs for evaluation.
 */
export default function MainContent(): JSX.Element {
  const {t} = useTranslation();
  const classes = useStyles();
  return (
    <Grid container direction='column' alignItems='center' justify='center' className={classes.mainContent}>
      <Typography>{t('mainContent.placeholder')}</Typography>
    </Grid>
  );
}
