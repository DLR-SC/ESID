import React from 'react';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import RedoIcon from '@mui/icons-material/Redo';
import UndoIcon from '@mui/icons-material/Undo';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import ShareIcon from '@mui/icons-material/Share';
import {useFullscreen} from 'rooks';
import {Box, Button} from '@mui/material';

export default function IconBar(): JSX.Element {
  const fsApi = useFullscreen();

  const toggleFullscreen = () => {
    if (fsApi?.isFullscreen) {
      fsApi?.exit();
    } else {
      fsApi?.request();
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
      }}
      height={60}
    >
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
  );
}
