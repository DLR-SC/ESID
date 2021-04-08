import {Grid, makeStyles, Typography} from '@material-ui/core';
import React from 'react';

const useStyles = makeStyles({
  mainContent: {
    width: '100%',
    height: '100%',
  },
});

export default function MainContent(): JSX.Element {
  const classes = useStyles();
  return (
    <Grid container direction={'column'} alignItems={'center'} justify={'center'} className={classes.mainContent}>
      <Typography>Main Content</Typography>
    </Grid>
  );
}
