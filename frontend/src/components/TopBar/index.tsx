import { Grid } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React from 'react';
import {useTranslation} from 'react-i18next';
import ApplicationMenu from './ApplicationMenu';

const useStyles = makeStyles({
  gridStyle: {
    width: '100%',
    height: '56px',
    backgroundColor: '#F0F0F2',
    borderBottom: '1px solid #D3D2D8',
    paddingLeft: '24px',
    paddingRight: '24px',
  },
  iconStyle: {
    height: '36px',
    width: 'auto',
  },
});

/**
 * This is the top navigation bar of the application. It contains the logo and a burger menu to access settings and
 * information.
 */
export default function TopBar(): JSX.Element {
  const {t} = useTranslation();
  const classes = useStyles();

  return (
    <Grid className={classes.gridStyle} container direction='row' alignItems='center'>
      <Grid container item alignItems='center' xs={2}>
        <img
          id='application-icon'
          className={classes.iconStyle}
          src='assets/logo/logo-200x66.svg'
          alt={t('topBar.icon-alt')}
        />
      </Grid>
      <Grid item xs={8} />
      <ApplicationMenu />
    </Grid>
  );
}
