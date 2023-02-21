import React from 'react';
import Scenario from './Scenario';
import IconBar from './IconBar';

import SimulationChart from './SimulationChart';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
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
        // The sidebar currently has a fixed width of 423px, so the main content takes up the remaining space.
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
