import React from 'react';
import {useTheme} from '@mui/material/styles';
import SearchBar from './SearchBar';
import SidebarTabs from './SidebarTabs';
import {Box, Container, Stack} from '@mui/material';
import Maps from './Maps';

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
        borderRight: `1px solid ${theme.palette.divider}`,
        background: theme.palette.background.default,
      }}
    >
      <Box>
        <SearchBar />
      </Box>
      <Box>
        <Maps />
      </Box>
      <Container disableGutters sx={{flexGrow: 1}}>
        <SidebarTabs />
      </Container>
    </Stack>
  );
}
