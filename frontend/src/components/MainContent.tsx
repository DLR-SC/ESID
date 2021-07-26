import {Grid, makeStyles} from '@material-ui/core';
import React from 'react';
//import {useTranslation} from 'react-i18next';
import Scenario from './Scenario';
import Icones from './Icones';

import SimulationChart from './SimulationChart';

const useStyles = makeStyles({
  mainContent: {
    marginLeft: '24px',
    marginright: '24px',
  },
  icon: {
    marginLeft: 'auto',
    marginRight: 'auto',
  },
});

export default function MainContent(): JSX.Element {
  //const {t} = useTranslation('global');
  const classes = useStyles();
  return (
    <Grid container direction="column" wrap="nowrap" className={classes.mainContent}>
      <Grid item className={classes.icon}>
        <Icones />
      </Grid>
      <Grid item>
        <Scenario />
      </Grid>
      <Grid item>
        <SimulationChart />
      </Grid>
    </Grid>
  );
}
