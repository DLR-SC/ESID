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
      direction='column'
      alignItems='stretch'
      justifyContent='flex-start'
      sx={{
        width: 422,
        height: 1,
        borderRight: `1p solid ${theme.palette.divider}`,
        background: theme.palette.background.default,
      }}
    >
      <Box>
        <SearchBar />
      </Box>
      <Box>
        <DistrictMap />
      </Box>
      <Container disableGutters sx={{flexGrow: 1}}>
        <SidebarTabs />
      </Container>
    </Stack>
  );
}
