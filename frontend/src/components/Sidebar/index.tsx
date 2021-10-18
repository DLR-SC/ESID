import React from 'react';
import SearchBar from './SearchBar';
import DistrictMap from './DistrictMap';
import SidebarTabs from './SidebarTabs';
import {makeStyles} from '@mui/styles';
import {Container, Stack} from '@mui/material';

const useStyles = makeStyles({
  sideBar: {
    width: '422px',
    height: '100%',
    borderRight: '1px solid #D3D2D8',
    backgroundColor: '#F2F2F2',
    paddingTop: '10px',
  },
  sidebarItem: {
    width: '422px',
  },
});

export default function Sidebar(): JSX.Element {
  const classes = useStyles();

  return (
    <Stack
      direction='column'
      alignItems='stretch'
      justifyContent='flex-start'
      className={classes.sideBar}>
      <div className={classes.sidebarItem}>
        <SearchBar />
      </div>
      <div className={classes.sidebarItem}>
        <DistrictMap />
      </div>
      <Container disableGutters className={classes.sidebarItem} sx={{flexGrow: 1}}>
        <SidebarTabs />
      </Container>
    </Stack>
  );
}
