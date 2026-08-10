// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {useEffect, useState, useContext, useMemo, useRef} from 'react';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import {useFullscreen} from 'rooks';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import PauseRounded from '@mui/icons-material/PauseRounded';
import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded';
import SkipNextRounded from '@mui/icons-material/SkipNextRounded';
import SkipPreviousRounded from '@mui/icons-material/SkipPreviousRounded';
import ToggleButton, {toggleButtonClasses} from '@mui/material/ToggleButton';
import Popover from '@mui/material/Popover';
import SettingsIcon from '@mui/icons-material/Settings';
import {useAppDispatch, useAppSelector} from 'store/hooks';
import {
  AggregationWindow,
  nextDay,
  previousDay,
  selectDate,
  setAggregationWindow,
  toggleRelativeNumbers,
} from 'store/DataSelectionSlice';
import {useTranslation} from 'react-i18next';
import {styled, ToggleButtonGroup, toggleButtonGroupClasses, Typography} from '@mui/material';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import useTheme from '@mui/material/styles/useTheme';
import SelectionChip from './SelectionChip';
import Divider from '@mui/material/Divider';
import {DataContext} from 'context/SelectedDataContext';

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({theme}) => ({
  gap: '1rem',
  [`& .${toggleButtonGroupClasses.firstButton}, & .${toggleButtonGroupClasses.middleButton}`]: {
    borderTopRightRadius: theme.shape.borderRadius,
    borderBottomRightRadius: theme.shape.borderRadius,
  },
  [`& .${toggleButtonGroupClasses.lastButton}, & .${toggleButtonGroupClasses.middleButton}`]: {
    borderTopLeftRadius: theme.shape.borderRadius,
    borderBottomLeftRadius: theme.shape.borderRadius,
    borderLeft: `1px solid ${theme.palette.divider}`,
  },
  [`& .${toggleButtonGroupClasses.lastButton}.${toggleButtonClasses.disabled}, & .${toggleButtonGroupClasses.middleButton}.${toggleButtonClasses.disabled}`]:
    {
      borderLeft: `1px solid ${theme.palette.action.disabledBackground}`,
    },
}));

export default function IconBar(): JSX.Element {
  const fsApi = useFullscreen();
  const dispatch = useAppDispatch();
  const {t} = useTranslation();
  const theme = useTheme();
  const [isPlaying, setIsPlaying] = useState(false);
  const [justStarted, setJustStarted] = useState(false);

  const {compartments} = useContext(DataContext)!;
  const {t: tBackend, i18n: i18nBackend} = useTranslation('backend');
  const selectedDay = useAppSelector((state) => state.dataSelection.date);
  const minDate = useAppSelector((state) => state.dataSelection.minDate);
  const maxDate = useAppSelector((state) => state.dataSelection.maxDate);
  const relativeNumbers = useAppSelector((state) => state.dataSelection.relativeNumbers ?? false);
  const aggregationWindow = useAppSelector((state) => state.dataSelection.aggregationWindow ?? AggregationWindow.Total);
  const selectedCompartment = useAppSelector((state) => state.dataSelection.compartment ?? '');

  // Settings popover state
  const settingsButtonRef = useRef<HTMLButtonElement | null>(null);
  const [settingsAnchorEl, setSettingsAnchorEl] = useState<HTMLElement | null>(null);
  const settingsOpen = Boolean(settingsAnchorEl);
  const openSettings = () => {
    if (settingsButtonRef.current) {
      setSettingsAnchorEl(settingsButtonRef.current);
    }
  };
  const closeSettings = () => setSettingsAnchorEl(null);

  const toggleFullscreen = () => {
    if (fsApi.isFullscreenEnabled) {
      void fsApi.disableFullscreen();
    } else {
      void fsApi.enableFullscreen();
    }
  };

  const compartmentNames = useMemo(() => {
    return (
      compartments?.map((compartment) => {
        const name = i18nBackend.exists(`infection-states.${compartment.name}`, {ns: 'backend'})
          ? tBackend(`infection-states.${compartment.name}`)
          : compartment.name;

        return {id: compartment.id, name};
      }) ?? []
    );
  }, [compartments, i18nBackend, tBackend]);

  const selectedCompartmentName = useMemo(() => {
    return compartmentNames.find((compartment) => compartment.id === selectedCompartment)?.name ?? '';
  }, [compartmentNames, selectedCompartment]);

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
        alignItems: 'center',
        height: '60px',
        gap: 2,
      }}
    >
      {/* Settings popover trigger */}
      <SelectionChip
        relativeNumbers={relativeNumbers}
        aggregationWindow={aggregationWindow}
        selectedCompartment={selectedCompartmentName}
        onClick={openSettings}
      />
      <Box>
        <Tooltip title={t('icon-bar.display-settings.tooltip')}>
          <Button aria-label='display-settings' ref={settingsButtonRef} onClick={openSettings}>
            <SettingsIcon />
          </Button>
        </Tooltip>
        <Tooltip title={t('icon-bar.previous-day-tooltip')}>
          <span>
            <Button
              aria-label='previous-day-button'
              disabled={selectedDay === minDate || isPlaying}
              onClick={() => dispatch(previousDay())}
            >
              <SkipPreviousRounded />
            </Button>
          </span>
        </Tooltip>
        <Tooltip title={t('icon-bar.play-pause-tooltip')}>
          <Button aria-label='play-pause-button' onClick={() => setIsPlaying(!isPlaying)}>
            {isPlaying ? <PauseRounded /> : <PlayArrowRounded />}
          </Button>
        </Tooltip>
        <Tooltip title={t('icon-bar.next-day-tooltip')}>
          <span>
            <Button
              aria-label='next-day-button'
              disabled={selectedDay === maxDate || isPlaying}
              onClick={() => dispatch(nextDay())}
            >
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

      {/* Settings Popover */}
      <Popover
        open={settingsOpen}
        anchorEl={settingsAnchorEl}
        onClose={closeSettings}
        anchorOrigin={{vertical: 'bottom', horizontal: 'left'}}
        transformOrigin={{vertical: 'top', horizontal: 'left'}}
        slotProps={{paper: {sx: {p: 2, minWidth: 280}}}}
      >
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 4, padding: 2}}>
          {/* Window row */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
              width: '100%',
            }}
          >
            <Box sx={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2}}>
              <Typography variant='h3'>{t('icon-bar.display-settings.time-period')}</Typography>
              <Tooltip arrow placement='right-start' title={t('icon-bar.display-settings.time-period-tooltip')}>
                <InfoOutlined
                  sx={{
                    color: theme.palette.info.light,
                    fontSize: '1rem',
                  }}
                />
              </Tooltip>
            </Box>

            <StyledToggleButtonGroup
              size='small'
              color='primary'
              exclusive
              aria-label='Aggregation window'
              sx={{width: '100%', gap: 3}}
            >
              <Tooltip title={t('icon-bar.display-settings.time-period-total-tooltip')} arrow placement='bottom-start'>
                <ToggleButton
                  value={AggregationWindow.Total}
                  selected={aggregationWindow === AggregationWindow.Total}
                  onClick={() => dispatch(setAggregationWindow(AggregationWindow.Total))}
                  sx={{width: '100%'}}
                >
                  {t('icon-bar.display-settings.total')}
                </ToggleButton>
              </Tooltip>
              <Divider orientation='vertical' flexItem />
              <Tooltip
                title={t('icon-bar.display-settings.time-period-one-day-tooltip')}
                arrow
                placement='bottom-start'
              >
                <ToggleButton
                  value={AggregationWindow.OneDay}
                  selected={aggregationWindow === AggregationWindow.OneDay}
                  onClick={() => dispatch(setAggregationWindow(AggregationWindow.OneDay))}
                  sx={{width: '100%'}}
                >
                  {t('icon-bar.display-settings.one-day')}
                </ToggleButton>
              </Tooltip>
              <Tooltip
                title={t('icon-bar.display-settings.time-period-seven-days-tooltip')}
                arrow
                placement='bottom-start'
              >
                <ToggleButton
                  value={AggregationWindow.SevenDays}
                  selected={aggregationWindow === AggregationWindow.SevenDays}
                  onClick={() => dispatch(setAggregationWindow(AggregationWindow.SevenDays))}
                  sx={{width: '100%'}}
                >
                  {t('icon-bar.display-settings.seven-days')}
                </ToggleButton>
              </Tooltip>
            </StyledToggleButtonGroup>
          </Box>

          {/* Number type row */}
          <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
            <Box sx={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2}}>
              <Typography variant='h3'>{t('icon-bar.display-settings.number-type')}</Typography>
              <Tooltip arrow placement='right-start' title={t('icon-bar.display-settings.number-type-tooltip')}>
                <InfoOutlined
                  sx={{
                    color: theme.palette.info.light,
                    fontSize: '1rem',
                  }}
                />
              </Tooltip>
            </Box>
            <StyledToggleButtonGroup
              size='small'
              color='primary'
              exclusive
              aria-label='Aggregation window'
              sx={{width: '100%', gap: 3}}
            >
              <Tooltip title={t('icon-bar.display-settings.relative-tooltip')} arrow placement='bottom-start'>
                <ToggleButton
                  value='relative-numbers'
                  selected={relativeNumbers}
                  onClick={() => dispatch(toggleRelativeNumbers())}
                  sx={{width: '100%'}}
                >
                  {t('icon-bar.display-settings.relative')}
                </ToggleButton>
              </Tooltip>
              <Tooltip title={t('icon-bar.display-settings.absolute-tooltip')} arrow placement='bottom-start'>
                <ToggleButton
                  value='absolute-numbers'
                  selected={!relativeNumbers}
                  onClick={() => dispatch(toggleRelativeNumbers())}
                  sx={{width: '100%'}}
                >
                  {t('icon-bar.display-settings.absolute')}
                </ToggleButton>
              </Tooltip>
            </StyledToggleButtonGroup>
          </Box>
        </Box>
      </Popover>
    </Box>
  );
}
