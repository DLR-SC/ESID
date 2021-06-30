import {Grid, makeStyles} from '@material-ui/core';
import React from 'react';
import MapCountry from './MapCountry';
import SearchBar from './SearchBar';
import History from './History';

const useStyles = makeStyles({
  sideBar: {
    width: '422px',
    height: '100%',
    borderRight: '1px solid #D3D2D8',
    paddingTop: '20px',
    backgroundColor: '#F2F2F2',
  },
});

export default function Sidebar(): JSX.Element {
  const classes = useStyles();

  return (
    <Grid
      container
      direction="column"
      alignItems="center"
      justify-content="space-around"
      alignContent="space-between"
      className={classes.sideBar}
    >
      <SearchBar />
      <MapCountry />
      <History />
    </Grid>
  );
}
