import {useTheme} from '@mui/material/styles';
import {useAppSelector} from '../store/hooks';
import React, {useRef, useState} from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';

/**
 * Draws a dashed line from the reference day in the compartment view to the reference day on the chart.
 */
export function ReferenceDayConnector(): JSX.Element {
  const theme = useTheme();
  const referenceDayPos = useAppSelector((state) => state.layoutSlice.referenceDayXPositions);
  const [globalX, setGlobalX] = useState(0);
  const resizeObserverRef = useRef<ResizeObserver>();

  // The following lines calculate the bounding boxes of the date-line connector, that connects the reference day from
  // the compartment selection to the reference day of the simulation chart.
  const dateLineTop = referenceDayPos?.top ?? 0;
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
      ref={(el: HTMLElement | null) => {
        if (!el) {
          return;
        }

        if (resizeObserverRef.current) {
          resizeObserverRef.current.disconnect();
        }

        resizeObserverRef.current = new ResizeObserver(() => setGlobalX(el.getBoundingClientRect().x));
        resizeObserverRef.current.observe(el);
      }}
      sx={{
        borderBottom: `1px solid ${theme.palette.divider}`,
        backgroundColor: 'transparent',
        height: theme.spacing(4),
      }}
    >
      <Box
        sx={{
          borderBottom: `2px dashed ${theme.palette.text.secondary}`,
          borderRight: dateLineWidth <= 0 ? `2px dashed ${theme.palette.text.secondary}` : '0',
          borderLeft: dateLineWidth > 0 ? `2px dashed ${theme.palette.text.secondary}` : '0',
          borderRadius: `0 0 ${dateLineWidth <= 0 ? '16px' : '0'} ${dateLineWidth > 0 ? '16px' : '0'}`,
          marginLeft: `${dateLineOffset}px`,
          width: `min(${Math.abs(dateLineWidth)}px, calc(100% - ${localX}px))`,
          height: 'calc(100% + 16px)',
          zIndex: 10,
          position: 'relative',
        }}
      />
    </Grid>
  );
}
