// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import LoadingContainer from './shared/LoadingContainer';
import Box from '@mui/material/Box';
import {useTheme} from '@mui/material/styles';
import {useSimulationChart} from './SimulationChart';
import useTimeSeriesChart from './shared/TimeSeriesChart';
import useContactMatrix from './ConctactMatrix';

export default function ContactMatrixView() {
  const theme = useTheme();

  const {root, chart, xAxis} = useTimeSeriesChart('contact-matrix-div');

  useSimulationChart(root, chart, xAxis);
  useContactMatrix(root, chart);

  return (
    <LoadingContainer sx={{width: '100%', height: '100%'}} show={false} overlayColor={theme.palette.background.paper}>
      <Box
        id='contact-matrix-div'
        sx={{
          height: '100%',
          margin: 0,
          padding: 0,
          backgroundColor: theme.palette.background.paper,
          backgroundImage: 'radial-gradient(#E2E4E6 10%, transparent 11%)',
          backgroundSize: '10px 10px',
          cursor: 'crosshair',
        }}
      />
    </LoadingContainer>
  );
}
