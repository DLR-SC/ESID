import {Grid, makeStyles, Typography} from '@material-ui/core';
import React from 'react';

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
  const classes = useStyles();
  return (
    <Grid container direction="column" alignItems="center" justify="center" className={classes.sideBar}>
      <Typography>Sidebar Content</Typography>
    </Grid>
  );
}
