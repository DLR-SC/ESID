import React from 'react';
import Scenario from './Scenario';
import IconBar from './IconBar';

import SimulationChart from './SimulationChart';
import {makeStyles} from '@mui/styles';
import {Divider, Grid} from '@mui/material';

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

// list of Name and Color for Scenario Cards
interface Scenario {
  id: string;
  label: string;
  color: string;
}
const scenarios: Scenario[] = [
  {
    id: 'basic',
    label: 'Basic Contact',
    color: '#3998DB',
  },
  {
    id: 'medium',
    label: 'Leichter Kontakt an Weihnachten',
    color: '#876BE3',
  },
  {
    id: 'big',
    label: 'Big Contact',
    color: '#CC5AC7',
  },
  {
    id: 'maximum',
    label: 'Maximum Contact',
    color: '#EBA73B',
  },
];

export default function MainContent(): JSX.Element {
  const classes = useStyles();
  return (
    <Grid container direction='column'>
      <Grid item className={classes.icon}>
        <IconBar />
      </Grid>
      <Grid item>
        <Scenario scenarios={scenarios} />
      </Grid>
      <Grid item>
        <Divider className={classes.divider} light />
      </Grid>
      <Grid item style={{flexGrow: 1}}>
        <SimulationChart scenarios={scenarios} />
      </Grid>
    </Grid>
  );
}
