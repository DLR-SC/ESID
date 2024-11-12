// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

// Third-party
import * as am5map from '@amcharts/amcharts5/map';
import {ZoomIn, ZoomOut, ZoomOutMap} from '@mui/icons-material';
import {ButtonGroup, IconButton, Stack} from '@mui/material';

interface CustomControlProps {
  chart: am5map.MapChart | null;
  onHomeClick?: () => void;
  maxZoomLevel: number; // MaxZoom Var from HeatMap.tsx
}

export default function CustomControl({chart, onHomeClick, maxZoomLevel}: CustomControlProps) {
  // Zoom In Handler
  const handleZoomIn = () => {
    if (chart && chart.seriesContainer) {
      try {
        const currentZoom = chart.get('zoomLevel', 1);
        const newZoom = Math.min(currentZoom * 2, maxZoomLevel);

        const centerX = chart.seriesContainer.width() / 2;
        const centerY = chart.seriesContainer.height() / 2;

        // zoom to new Point with animation (300ms)
        chart.zoomToPoint({x: centerX, y: centerY}, newZoom, true, 300);
      } catch (error) {
        console.error('Error while zooming in:', error);
      }
    }
  };

  // Zoom Out Handler
  const handleZoomOut = () => {
    if (chart && chart.seriesContainer) {
      try {
        const currentZoom = chart.get('zoomLevel', 1);
        const minZoom = chart.get('minZoomLevel', 1);

        const newZoom = Math.max(currentZoom / 2, minZoom);

        const centerX = chart.seriesContainer.width() / 2;
        const centerY = chart.seriesContainer.height() / 2;

        chart.zoomToPoint({x: centerX, y: centerY}, newZoom, true, 300);
      } catch (error) {
        console.error('Error while zooming out:', error);
      }
    }
  };

  // Reset view
  const handleReset = () => {
    if (chart) {
      try {
        chart.goHome(300);
        onHomeClick?.(); // Callback to HeatMap.tsx to synch selected area
      } catch (error) {
        console.error('Error while resetting zoom:', error);
      }
    }
  };

  // If there's no chart, don't render.
  if (!chart) return null;

  // UI
  return (
    <Stack
      spacing={2}
      sx={{
        position: 'absolute',
        right: 16,
        bottom: 32,
        zIndex: 1000,
        pointerEvents: 'auto',
        '& .zoomBackButton': {
          color: 'text.primary',
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            color: 'primary.main',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            transform: 'scale(1.1)',
          },
        },
        '& .MuiButtonGroup-root': {
          borderRadius: '8px',
          overflow: 'hidden',
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
        '& .zoomButtons': {
          borderRadius: 0,
          color: 'text.primary',
          backgroundColor: 'transparent',
          border: 'none',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            color: 'primary.main',
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
          },
          '&:active': {
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
          },
        },
      }}
    >
      {/* Reset-Button */}
      <IconButton onClick={handleReset} size='small' aria-label='reset zoom' className='zoomBackButton'>
        <ZoomOutMap />
      </IconButton>

      {/* Button Group */}
      <ButtonGroup orientation='vertical' aria-label='Searchbar' variant='contained'>
        <IconButton onClick={handleZoomIn} size='small' aria-label='zoom in' className='zoomButtons'>
          <ZoomIn />
        </IconButton>

        <IconButton onClick={handleZoomOut} size='small' aria-label='zoom out' className='zoomButtons'>
          <ZoomOut />
        </IconButton>
      </ButtonGroup>
    </Stack>
  );
}
