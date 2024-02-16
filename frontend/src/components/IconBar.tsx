// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {useEffect, useState} from 'react';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import {useFullscreen} from 'rooks';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import PauseRounded from '@mui/icons-material/PauseRounded';
import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded';
import SkipNextRounded from '@mui/icons-material/SkipNextRounded';
import SkipPreviousRounded from '@mui/icons-material/SkipPreviousRounded';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {nextDay, previousDay, selectDate} from '../store/DataSelectionSlice';
import {useTranslation} from 'react-i18next';

export default function IconBar(): JSX.Element {
  const fsApi = useFullscreen();
  const dispatch = useAppDispatch();
  const {t} = useTranslation();

  const [isPlaying, setIsPlaying] = useState(false);
  const [justStarted, setJustStarted] = useState(false);

  const selectedDay = useAppSelector((state) => state.dataSelection.date);
  const minDate = useAppSelector((state) => state.dataSelection.minDate);
  const maxDate = useAppSelector((state) => state.dataSelection.maxDate);

  const toggleFullscreen = () => {
    if (fsApi.isFullscreenEnabled) {
      void fsApi.disableFullscreen();
    } else {
      void fsApi.enableFullscreen();
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
      }, 1000);

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
      <Tooltip title={t('icon-bar.previous-day-tooltip')}>
        <span>
          <Button disabled={selectedDay === minDate || isPlaying} onClick={() => dispatch(previousDay())}>
            <SkipPreviousRounded />
          </Button>
        </span>
      </Tooltip>
      <Tooltip title={t('icon-bar.play-pause-tooltip')}>
        <Button onClick={() => setIsPlaying(!isPlaying)}>{isPlaying ? <PauseRounded /> : <PlayArrowRounded />}</Button>
      </Tooltip>
      <Tooltip title={t('icon-bar.next-day-tooltip')}>
        <span>
          <Button disabled={selectedDay === maxDate || isPlaying} onClick={() => dispatch(nextDay())}>
            <SkipNextRounded />
          </Button>
        </span>
      </Tooltip>
      <Tooltip title={t('icon-bar.fullscreen-tooltip')}>
        <Button onClick={toggleFullscreen}>
          <FullscreenIcon />
        </Button>
      </Tooltip>
    </Box>
  );
}
