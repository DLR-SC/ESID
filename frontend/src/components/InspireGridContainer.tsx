import React, {useContext, useEffect, useMemo, useState} from 'react';
import LoadingContainer from './shared/LoadingContainer';
import {useTheme} from '@mui/material';
import BaseLayer from './InspireGridComponents/BaseLayerTest';
import {useAppDispatch, useAppSelector} from 'store/hooks';
import {setMapZoom, setMapBounds, setMapCenter} from 'store/inspireGridSlice'
import Box from '@mui/material/Box';

export default function InspireGridContainer() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  
  const mapZoom = useAppSelector((state) => state.inspireGrid.zoom);
  const mapBounds = useAppSelector((state) => state.inspireGrid.bounds);
  const mapCenter = useAppSelector((state) => state.inspireGrid.center);

  const handleSetMapZoom = React.useCallback((zoom: number) => {
    dispatch(setMapZoom(zoom));
  }, [dispatch]);

  const handleSetMapBounds = React.useCallback((bounds: [[number, number], [number, number]]) => {
    dispatch(setMapBounds(bounds));
  }, [dispatch]);

  const handleSetMapCenter = React.useCallback((center: [number, number]) => {
    dispatch(setMapCenter(center));
  }, [dispatch]);

  return (
    <LoadingContainer
      sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}
      show={false} // Change to when the grid is loaded
      overlayColor={theme.palette.background.paper}
    >
      <Box
        sx={{
          height: '100%',
          margin: 0,
          padding: 0,
          backgroundColor: theme.palette.background.paper,
          backgroundImage: 'radial-gradient(#E2E4E6 10%, transparent 11%)',
          backgroundSize: '10px 10px',
          cursor: 'crosshair',
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <BaseLayer 
          mapZoom={mapZoom}
          mapBounds={mapBounds}
          mapCenter={mapCenter}
          setMapZoom={handleSetMapZoom}
          setMapBounds={handleSetMapBounds}
          setMapCenter={handleSetMapCenter}
        />
      </Box>
    </LoadingContainer>
  );

}