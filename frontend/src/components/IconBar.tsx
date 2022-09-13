import React, {useEffect, useState} from 'react';
/*import AutorenewIcon from '@mui/icons-material/Autorenew';
import RedoIcon from '@mui/icons-material/Redo';
import UndoIcon from '@mui/icons-material/Undo';
import ShareIcon from '@mui/icons-material/Share';*/
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import ListIcon from '@mui/icons-material/List';
import {useFullscreen} from 'rooks';
import {Box, Button, Dialog, Tooltip} from '@mui/material';
import {SkipNextRounded, SkipPreviousRounded} from '@mui/icons-material';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {nextDay, previousDay, selectDate} from '../store/DataSelectionSlice';
import {useTranslation} from 'react-i18next';
import ChartToggle from './ChartToggle';

export default function IconBar(): JSX.Element {
  const [open, setOpen] = React.useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const fsApi = useFullscreen();
  const dispatch = useAppDispatch();
  const {t} = useTranslation();

  const [isPlaying, setIsPlaying] = useState(false);
  const [justStarted, setJustStarted] = useState(false);

  const selectedDay = useAppSelector((state) => state.dataSelection.date);
  const minDate = useAppSelector((state) => state.dataSelection.minDate);
  const maxDate = useAppSelector((state) => state.dataSelection.maxDate);

  const toggleFullscreen = () => {
    if (fsApi?.isFullscreen) {
      fsApi?.exit();
    } else {
      fsApi?.request();
    }
  };

  useEffect(() => {
    if (isPlaying) {
      // if we are already on the last day, we start from the first day
      if (selectedDay === maxDate && minDate && !justStarted) {
        dispatch(selectDate(minDate));
        setJustStarted(true);
      }

      const intervalId = setTimeout(() => {
        // when we reach the last day, we stop automatically
        if (selectedDay === maxDate) {
          setIsPlaying(false);
          setJustStarted(false);
        } else {
          dispatch(nextDay());
        }
      }, 500);

      return () => clearTimeout(intervalId);
    }

    return () => undefined;
  }, [dispatch, isPlaying, minDate, maxDate, selectedDay, justStarted]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: '60px',
      }}
    >
      <Tooltip title={t<string>('icon-bar.previous-day-tooltip')}>
        <span>
          <Button disabled={selectedDay === minDate || isPlaying} onClick={() => dispatch(previousDay())}>
            <SkipPreviousRounded />
          </Button>
        </span>
      </Tooltip>
      {/* The Play/Pause feature is currently not feasible due to performance problems.
      <Tooltip title={t<string>('icon-bar.play-pause-tooltip')}>
        <Button onClick={() => setIsPlaying(!isPlaying)}>{isPlaying ? <PauseRounded /> : <PlayArrowRounded />}</Button>
      </Tooltip>
      */}
      <Tooltip title={t<string>('icon-bar.next-day-tooltip')}>
        <span>
          <Button disabled={selectedDay === maxDate || isPlaying} onClick={() => dispatch(nextDay())}>
            <SkipNextRounded />
          </Button>
        </span>
      </Tooltip>
      {/*
      <Button disabled>
        <AutorenewIcon />
      </Button>
        <Button disabled>
        <UndoIcon />
        </Button>
        <Button disabled>
        <RedoIcon />
        </Button>
        */}
      <Tooltip title={t<string>('icon-bar.fullscreen-tooltip')}>
        <Button onClick={toggleFullscreen}>
          <FullscreenIcon />
        </Button>
      </Tooltip>
      {/*
      <Button disabled>
        <ShareIcon />
      </Button>
      */}
      <Tooltip title={'Filter Chart Anzeigen'}>
        <Button
          onClick={() => {
            handleOpen();
          }}
        >
          <ListIcon />
        </Button>
      </Tooltip>
      <Dialog
        maxWidth='lg'
        sx={{
          display: 'flex',
          width: '100%',
          justifyContent: 'center',
          alignSelf: 'center',
        }}
        fullWidth={true}
        open={open}
      >
        <ChartToggle onclose={() => setOpen(false)} />
      </Dialog>
    </Box>
  );
}
