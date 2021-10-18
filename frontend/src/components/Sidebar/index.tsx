import React from 'react';
import SearchBar from './SearchBar';
import DistrictMap from './DistrictMap';
import SidebarTabs from './SidebarTabs';
import { makeStyles } from '@mui/styles';
import {Grid} from '@mui/material';

const useStyles = makeStyles({
  sideBar: {
    width: '422px',
    height: '100%',
    borderRight: '1px solid #D3D2D8',
    backgroundColor: '#F2F2F2',
    paddingTop: '10px'
  },
  sidebarItem: {
    width: '422px',
    height: '100%',
  },
});

export default function Sidebar(): JSX.Element {
  const classes = useStyles();

  return (
    <Grid
      container
      direction='column'
      alignItems="stretch"
      justifyContent="center"
      className={classes.sideBar}
    >
      <Grid item xs={1}>
        <div className={classes.sidebarItem}>
          <SearchBar />
        </div>
      </Grid>
      <Grid item xs={5}>
        <div className={classes.sidebarItem}>
          <DistrictMap />
        </div>
      </Grid>
      <Grid item xs>
        <div className={classes.sidebarItem}>
          <SidebarTabs />
        </div>
      </Grid>
    </Grid>
  );
}
