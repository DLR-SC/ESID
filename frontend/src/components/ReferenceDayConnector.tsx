// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {darken, useTheme} from '@mui/material/styles';
import {useAppSelector} from '../store/hooks';
import React from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import {useBoundingclientrectRef} from 'rooks';

/**
 * Draws a dashed line from the reference day in the compartment view to the reference day on the chart.
 */
export function ReferenceDayConnector(): JSX.Element {
  const theme = useTheme();
  const referenceDayPos = useAppSelector((state) => state.layoutSlice.referenceDayXPositions);

  const [ref, boundingRect] = useBoundingclientrectRef();

  // The following lines calculate the bounding boxes of the date-line connector, that connects the reference day from
  // the compartment selection to the reference day of the simulation chart.
  const dateLineTop = referenceDayPos?.top ?? 0;
  const globalX = boundingRect?.x ?? 0;
  const localX = dateLineTop - globalX;
  const dateLineBot = referenceDayPos?.bottom ?? 0;

  let dateLineWidth = dateLineBot - dateLineTop + 1;
  if (dateLineWidth < 0) {
    dateLineWidth = Math.max(dateLineWidth, -localX + 2);
  }

  let dateLineOffset: number;
  if (dateLineWidth > 0) {
    dateLineOffset = localX - 2;
  } else {
    dateLineOffset = Math.max(localX + dateLineWidth - 2, 0);
  }

  return (
    <Grid
      id='main-content-horizontal-spacer'
      item
      ref={ref}
      sx={{
        borderBottom: `1px solid ${theme.palette.divider}`,
        backgroundColor: 'transparent',
        height: theme.spacing(4),
      }}
    >
      <Box
        sx={{
          borderBottom: `2px dashed ${darken(theme.palette.divider, 0.25)}`,
          borderRight: dateLineWidth <= 0 ? `2px dashed ${darken(theme.palette.divider, 0.25)}` : '0',
          borderLeft: dateLineWidth > 0 ? `2px dashed ${darken(theme.palette.divider, 0.25)}` : '0',
          borderRadius: '0',
          marginTop: '0.15em',
          marginLeft: `${dateLineOffset}px`,
          width: `min(${Math.abs(dateLineWidth)}px, calc(100% - ${localX}px))`,
          height: 'calc(100% + 16px - 0.15em)',
          zIndex: 10,
          position: 'relative',
        }}
      />
    </Grid>
  );
}
