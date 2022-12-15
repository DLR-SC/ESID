import React from 'react';
import {useTheme} from '@mui/material/styles';
import SearchBar from './SearchBar';
import DistrictMap from './DistrictMap';
import SidebarTabs from './SidebarTabs';
import {Box, Container, Stack} from '@mui/material';

export default function Sidebar(): JSX.Element {
  const theme = useTheme();

  return (
    <Stack
      id='sidebar-root'
      direction='column'
      alignItems='stretch'
      justifyContent='flex-start'
      sx={{
        width: "422px",
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
