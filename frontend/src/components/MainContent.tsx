// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import Grid from '@mui/material/Grid';
import {useTheme} from '@mui/material/styles';
import InspireGrid from './InspireGridContainer';

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
      <InspireGrid />
    </Grid>
  );
}
