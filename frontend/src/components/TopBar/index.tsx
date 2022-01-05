import {Grid} from '@mui/material';
import {useTheme} from '@mui/material/styles';
import React from 'react';
import {useTranslation} from 'react-i18next';
import ApplicationMenu from './ApplicationMenu';

/**
 * This is the top navigation bar of the application. It contains the logo and a burger menu to access settings and
 * information.
 */
export default function TopBar(): JSX.Element {
  const {t} = useTranslation();
  const theme = useTheme();

  return (
    <Grid
      sx={{
        width: '100%',
        height: '56px',
        backgroundColor: theme.palette.background.default,
        borderBottom: `1px solid ${theme.palette.divider}`,
        paddingLeft: theme.spacing(4),
        paddingRight: theme.spacing(4),
      }}
      container
      direction='row'
      alignItems='center'
    >
      <Grid container item alignItems='center' xs={2}>
        <img
          id='application-icon'
          style={{
            height: '36px',
            width: 'auto',
          }}
          src='assets/logo/logo-200x66.svg'
          alt={t('topBar.icon-alt')}
        />
      </Grid>
      <Grid item xs={8} />
      <ApplicationMenu />
    </Grid>
  );
}
