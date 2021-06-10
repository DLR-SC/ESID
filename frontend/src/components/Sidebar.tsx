import {Grid, makeStyles, Typography} from '@material-ui/core';
import React from 'react';
import {useTranslation} from 'react-i18next';

const useStyles = makeStyles({
  sideBar: {
    width: '422px',
    height: '100%',
    borderRight: '1px solid #D3D2D8',
  },
});

/**
 * This is currently a placeholder. It will contain the map view and the events view.
 */
export default function Sidebar(): JSX.Element {
  const {t} = useTranslation();
  const classes = useStyles();
  return (
    <Grid container direction="column" alignItems="center" justify="center" className={classes.sideBar}>
      <Typography>{t('sideBar.placeholder')}</Typography>
    </Grid>
  );
}
