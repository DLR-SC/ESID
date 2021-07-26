import {Box} from '@material-ui/core';
import React from 'react';
import {makeStyles, createStyles, Theme} from '@material-ui/core/styles';
import AutorenewIcon from '@material-ui/icons/Autorenew';
import RefreshIcon from '@material-ui/icons/Refresh';
import ReplayIcon from '@material-ui/icons/Replay';
import FullscreenIcon from '@material-ui/icons/Fullscreen';
import ShareIcon from '@material-ui/icons/Share';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      '& > svg': {
        margin: theme.spacing(2),
      },
    },
  })
);

export default function Icones() {
  const classes = useStyles();

  return (
    <Box display="flex" width={500} height={60}>
      <Box className={classes.root} m="auto">
        <AutorenewIcon />
        <RefreshIcon />
        <ReplayIcon />
        <FullscreenIcon />
        <ShareIcon />
      </Box>
    </Box>
  );
}
