import React from 'react';
import Scenario from './Scenario';
import IconBar from './IconBar';

import SimulationChart from './SimulationChart';
import { makeStyles } from '@mui/styles';
import {Divider, Grid } from '@mui/material';

const useStyles = makeStyles({
  icon: {
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  divider: {
    borderBottom: '2px solid #F2F2F2',
    backgroundColor: 'transparent',
    margin: '20px 0 0 0',
  },
});

export default function MainContent(): JSX.Element {
  const classes = useStyles();
  return (
    <Grid container direction='column'>
      <Grid item className={classes.icon}>
        <IconBar />
      </Grid>
      <Grid item>
        <Scenario />
      </Grid>
      <Grid item>
        <Divider className={classes.divider} light />
      </Grid>
      <Grid item style={{flexGrow: 1}}>
        <SimulationChart />
      </Grid>
    </Grid>
  );
}
