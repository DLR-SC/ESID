import React from 'react';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import RedoIcon from '@mui/icons-material/Redo';
import UndoIcon from '@mui/icons-material/Undo';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import ShareIcon from '@mui/icons-material/Share';
import {useFullscreen} from 'rooks';
import {createStyles, makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import {Box, Button} from '@mui/material';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      '& > svg': {
        margin: theme.spacing(2),
      },
    },
  })
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
