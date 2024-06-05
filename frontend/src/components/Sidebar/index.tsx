// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import {useTheme} from '@mui/material/styles';
import SearchBar from './SearchBar';
import DistrictMap from './DistrictMap';
import SidebarTabs from './SidebarTabs';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';

export default function Sidebar(): JSX.Element {
  const theme = useTheme();

  return (
    <Stack
      id='sidebar-root'
      direction='column'
      alignItems='stretch'
      justifyContent='flex-start'
      sx={{
        width: '422px',
        borderRight: `1px solid ${theme.palette.divider}`,
        background: theme.palette.background.default,
      }}
    >
      <Box id='sidebar-map-search-bar-wrapper'>
        <SearchBar />
      </Box>
      <Box id='sidebar-map-wrapper'>
        <DistrictMap />
      </Box>
      <Container disableGutters sx={{flexGrow: 1}}>
        <SidebarTabs />
      </Container>
    </Stack>
  );
}
