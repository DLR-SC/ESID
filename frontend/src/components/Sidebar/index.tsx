import React from 'react';
import {useTheme} from '@mui/material/styles';
import SearchBar from './SearchBar';
import DistrictMap from './DistrictMap';
//import GridHeatmap from './GridHeatmap'; 
import {Box, Container, Divider, Stack} from '@mui/material';
import SidebarTabs from './SidebarTabs';
import GridHeatmap from './GridHeatmap';

export default function Sidebar(): JSX.Element {
  const theme = useTheme();

  return (
    <Stack
      direction='column'
      alignItems='stretch'
      spacing ={2}
      divider={<Divider orientation="vertical" flexItem />}
      justifyContent='flex-start'
      sx={{
        width: 900,
        height: 1,
        borderRight: `1px solid ${theme.palette.divider}`,
        background: theme.palette.background.default,
      }}
    >
      <Box>
        <SearchBar />
      </Box>
      <Box>
        <DistrictMap /> 
      </Box>
{/*       <Box>
        <GridHeatmap/>
      </Box> */}

        
      <Container disableGutters sx={{flexGrow: 0}}>
        <SidebarTabs />
      </Container>
    </Stack>
  );
}
