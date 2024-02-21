// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import Scenario from './Scenario';
import IconBar from './IconBar';

import SimulationChart from './SimulationChart';
import Grid from '@mui/material/Grid';
import {useTheme} from '@mui/material/styles';
import {ReferenceDayConnector} from './ReferenceDayConnector';

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
      <ReferenceDayConnector />
      <Grid id='main-content-simulation-chart-wrapper' item sx={{flexGrow: 1}}>
        <SimulationChart />
      </Grid>
    </Grid>
  );
}
