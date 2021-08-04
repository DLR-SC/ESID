import {Grid, makeStyles} from '@material-ui/core';
import React from 'react';
import Scenario from './Scenario';
import Icones from './Icones';

import SimulationChart from './SimulationChart';

const useStyles = makeStyles({
  icon: {
    marginLeft: 'auto',
    marginRight: 'auto',
  },
});

export default function MainContent(): JSX.Element {
  const classes = useStyles();
  return (
    <Grid container direction="column" wrap="nowrap">
      <Grid item className={classes.icon}>
        <Icones />
      </Grid>
      <Grid item>
        <Scenario />
      </Grid>
      <Grid item style={{flexGrow: 1}}>
        <SimulationChart />
      </Grid>
    </Grid>
  );
}
