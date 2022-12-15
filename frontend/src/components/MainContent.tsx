import React from 'react';
import Scenario from './Scenario';
import IconBar from './IconBar';

//import Aggregator from './AggregationEditor';

import SimulationChart from './SimulationChart';
import {Divider, Grid} from '@mui/material';
import {useTheme} from '@mui/material/styles';

export default function MainContent(): JSX.Element {
  const theme = useTheme();
  return (
    <Grid
      id='main-content-root'
      container
      direction='column'
      sx={{
        background: theme.palette.background.default,
        maxWidth: 'calc(100% - 423px)',
        width: 'calc(100% - 423px)',
      }}
    >
      <Grid
        id='main-content-icon-bar-wrapper'
        item
        sx={{
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        <IconBar />
      </Grid>
      <Grid sx={{width: '100%', maxWidth: '100%'}} id='main-content-scenario-wrapper' item>
        <Scenario />
      </Grid>
      <Grid id='main-content-horizontal-spacer' item>
        <Divider
          sx={{
            borderBottom: `1px solid ${theme.palette.divider}`,
            backgroundColor: 'transparent',
            margin: `${theme.spacing(4)} 0 0 0`,
          }}
        />
      </Grid>
      <Grid id='main-content-simulation-chart-wrapper' item sx={{flexGrow: 1}}>
        <SimulationChart />
      </Grid>
    </Grid>
  );
}
