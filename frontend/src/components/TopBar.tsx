import React from 'react';
import {Button, Grid, makeStyles} from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';

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
  menuStyle: {},
});

export default function TopBar(): JSX.Element {
  const classes = useStyles();

  return (
    <Grid className={classes.gridStyle} container direction="row" alignItems="center">
      <Grid container item alignItems="center" xs={2}>
        <img
          id="application-icon"
          className={classes.iconStyle}
          src="assets/logo/logo-200x66.svg"
          alt="ESID Application Icon"
        />
      </Grid>
      <Grid item xs={8} />
      <Grid container item alignItems="center" justify="flex-end" xs={2}>
        <Button aria-controls="simple-menu" aria-haspopup="true">
          <MenuIcon className={classes.menuStyle} />
        </Button>
      </Grid>
    </Grid>
  );
}
