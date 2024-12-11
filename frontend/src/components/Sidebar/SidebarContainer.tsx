//SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {useState, useEffect, useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {useAppDispatch, useAppSelector} from 'store/hooks';
import {HeatmapLegend} from 'types/heatmapLegend';
import i18n from 'util/i18n';
import SidebarTabs from './SidebarTabs';
import {selectDistrict} from 'store/DataSelectionSlice';
import {selectHeatmapLegend} from 'store/UserPreferenceSlice';
import {useTheme} from '@mui/material/styles';
import {GeoJsonProperties} from 'geojson';
import Box from '@mui/material/Box';
import ToggleButton from '@mui/material/ToggleButton';

export default function MapContainer() {
  const {t} = useTranslation();
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const storeSelectedArea = useAppSelector((state) => state.dataSelection.district);
  const storeHeatLegend = useAppSelector((state) => state.userPreference.selectedHeatmap);

  const defaultValue = useMemo(() => {
    return {
      RS: '00000',
      GEN: t('germany'),
      BEZ: '',
      id: -1,
    };
  }, [t]);

  const [selectedArea, setSelectedArea] = useState<GeoJsonProperties>(
    storeSelectedArea.name != ''
      ? {RS: storeSelectedArea.ags, GEN: storeSelectedArea.name, BEZ: storeSelectedArea.type}
      : defaultValue
  );
  const [legend] = useState<HeatmapLegend>(storeHeatLegend);

  // Set selected area on first load. If language change and selected area is germany, set default value again to update the name
  useEffect(() => {
    if (selectedArea?.RS === '00000') {
      setSelectedArea(defaultValue);
    }
    // This effect should only run when the language changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language]);

  // Set selected area in store
  useEffect(() => {
    dispatch(
      selectDistrict({
        ags: String(selectedArea?.['RS']),
        name: String(selectedArea?.['GEN']),
        type: String(selectedArea?.['BEZ']),
      })
    );
    // This effect should only run when the selectedArea changes
  }, [selectedArea, dispatch]);

  // Set legend in store
  useEffect(() => {
    dispatch(selectHeatmapLegend({legend: legend}));
    // This effect should only run when the legend changes
  }, [legend, dispatch]);

  const [expanded, setExpanded] = useState(false);

  return (
    <Box
      id='sidebar-root'
      sx={{
        // Self
        width: expanded ? '1200px' : '422px',
        height: '100%',
        borderRight: `1px solid ${theme.palette.divider}`,
        background: theme.palette.background.default,
        display: 'flex',
      }}
    >
      <SidebarTabs />
      <ToggleButton
        color='primary'
        selected={expanded}
        onChange={() => setExpanded(!expanded)}
        sx={{height: '100%', minWidth: 0, padding: 0}}
        value=''
      >
        {expanded ? '◀' : '▶'}
      </ToggleButton>
    </Box>
  );
}
