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
      container
      direction='column'
      sx={{
        background: theme.palette.background.default,
      }}
    >
      <Grid
        item
        sx={{
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        <IconBar />
      </Grid>
      <Grid item>
        <Scenario />
      </Grid>
      <Grid item>
        <Divider
          sx={{
            borderBottom: `1px solid ${theme.palette.divider}`,
            backgroundColor: 'transparent',
            margin: `${theme.spacing(4)} 0 0 0`,
          }}
        />
      </Grid>
      <Grid item sx={{flexGrow: 1}}>
        <SimulationChart />
      </Grid>
    </Grid>
  );
}
