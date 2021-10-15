import {Box} from '@material-ui/core';
import React from 'react';
import Button from '@material-ui/core/Button';
import {makeStyles, createStyles, Theme} from '@material-ui/core/styles';
import AutorenewIcon from '@material-ui/icons/Autorenew';
import RedoIcon from '@material-ui/icons/Redo';
import UndoIcon from '@material-ui/icons/Undo';
import FullscreenIcon from '@material-ui/icons/Fullscreen';
import ShareIcon from '@material-ui/icons/Share';
import {useFullscreen} from 'rooks';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      '& > svg': {
        margin: theme.spacing(2),
      },
    },
  }),
);


export default function IconBar(): JSX.Element {
  const classes = useStyles();
  const fsApi = useFullscreen();

  const toggleFullscreen = () => {
    if (fsApi?.isFullscreen) {
      fsApi?.exit();
    } else {
      fsApi?.request();
    }
  };

  return (
    <Box display='flex' height={60}>
      <Box className={classes.root} m='auto'>
        <Button disabled>
          <AutorenewIcon />
        </Button>
        <Button disabled>
          <UndoIcon />
        </Button>
        <Button disabled>
          <RedoIcon />
        </Button>
        <Button>
          <FullscreenIcon onClick={toggleFullscreen} />
        </Button>
        <Button disabled>
          <ShareIcon />
        </Button>
      </Box>
    </Box>
  );
}
