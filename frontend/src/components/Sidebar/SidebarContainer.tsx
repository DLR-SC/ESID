//SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import SidebarTabs from './SidebarTabs';
import {useTheme} from '@mui/material/styles';
import Box from '@mui/material/Box';
import {useAppSelector} from '../../store/hooks';

export default function MapContainer() {
  const theme = useTheme();
  const selectedTab = useAppSelector((state) => state.userPreference.selectedSidebarTab);

  return (
    <Box
      id='sidebar-root'
      sx={{
        // Self
        width: selectedTab == '2' ? '650px' : '422px',
        transition: 'width 1s',
        height: '100%',
        borderRight: `1px solid ${theme.palette.divider}`,
        background: theme.palette.background.default,
        display: 'flex',
      }}
    >
      <SidebarTabs />
    </Box>
  );
}
