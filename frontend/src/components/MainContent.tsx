import {Grid, makeStyles} from '@material-ui/core';
import React from 'react';
import Scenario from './Scenario';
import Icones from './Icones';
import Divider from '@material-ui/core/Divider';

import SimulationChart from './SimulationChart';

const useStyles = makeStyles({
  icon: {
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  divider: {
    borderBottom: '2px dotted #3998DB',
    backgroundColor: 'transparent',
    margin: '20px 0 0 0',
  },
});

export default function MainContent(): JSX.Element {
  const classes = useStyles();
  return (
    <Grid container direction="column" style={{width: '100vw'}}>
      <Grid item className={classes.icon}>
        <Icones />
      </Grid>
      <Grid item style={{width: '100%'}}>
        <Scenario />
      </Grid>
      <Grid item style={{width: '100%'}}>
        <Divider className={classes.divider} light />
      </Grid>
      <Grid item style={{width: '100%', flexGrow: 1}}>
        <SimulationChart />
      </Grid>
    </Grid>
  );
}
