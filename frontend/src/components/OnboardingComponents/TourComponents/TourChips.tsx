// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {useCallback} from 'react';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import MapIcon from '@mui/icons-material/Map';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import FilterListIcon from '@mui/icons-material/FilterList';
import {useAppSelector, useAppDispatch} from '../../../store/hooks';
import {useTheme} from '@mui/material/styles';
import {TourType} from '../../../types/tours';
import TourSteps from './TourSteps';
import {setShowWelcomeModal, setShowPopover, setActiveTour} from '../../../store/UserOnboardingSlice';
import {useTranslation} from 'react-i18next';

/**
 * This component is a row of chips that represent the tours that the user can take
 */
export default function TourChips(): JSX.Element {
  const theme = useTheme();
  const tours = useAppSelector((state) => state.userOnboarding.tours);
  const dispatch = useAppDispatch();
  const {t: tOnboarding} = useTranslation('onboarding');

  // this callback function is called when a chip is clicked, it sets the current tour and closes modals and popovers if they are open
  const onTourClick = useCallback(
    (tour: TourType) => {
      console.log('Tour clicked:', tour);
      dispatch(setShowWelcomeModal(false));
      dispatch(setShowPopover(false));
      dispatch(setActiveTour(tour));
    },
    [dispatch]
  );

  return (
    <>
      <Stack
        direction='row'
        spacing={1}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          padding: theme.spacing(2),
        }}
      >
        <Chip
          icon={<MapIcon />}
          color={tours.districtMap ? 'default' : 'primary'}
          label={tOnboarding(`tours.districtMap.title`)}
          variant='outlined'
          onClick={() => onTourClick('districtMap')}
        />
        <Chip
          icon={<DashboardIcon />}
          color={tours.scenario ? 'default' : 'primary'}
          label={tOnboarding(`tours.scenario.title`)}
          variant='outlined'
          onClick={() => onTourClick('scenario')}
        />
        <Chip
          icon={<ShowChartIcon />}
          color={tours.lineChart ? 'default' : 'primary'}
          label={tOnboarding(`tours.lineChart.title`)}
          variant='outlined'
          onClick={() => onTourClick('lineChart')}
        />
        <Chip
          icon={<FilterListIcon />}
          color={tours.filter ? 'default' : 'primary'}
          label={tOnboarding(`tours.filter.title`)}
          variant='outlined'
          onClick={() => onTourClick('filter')}
        />
      </Stack>
      <TourSteps />
    </>
  );
}
