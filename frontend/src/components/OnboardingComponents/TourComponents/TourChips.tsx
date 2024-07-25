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
import {setModalTour, setShowPopover, setToursToShow} from '../../../store/UserOnboardingSlice';

/**
 * This component is a row of chips that represent the tours that the user can take
 */
export default function TourChips(): JSX.Element {
  const theme = useTheme();
  const tours = useAppSelector((state) => state.userOnboarding.tours);
  const dispatch = useAppDispatch();

  // this callback function is called when a chip is clicked, it says the current tour and closes modals and popovers if they are open
  const onTourClick = useCallback(
    (tour: TourType) => {
      console.log('Tour clicked:', tour);
      dispatch(setModalTour(false));
      dispatch(setShowPopover(false));
      dispatch(setToursToShow(tour));
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
          label='District map'
          variant='outlined'
          onClick={() => onTourClick('districtMap')}
        />
        <Chip
          icon={<DashboardIcon />}
          color={tours.scenario ? 'default' : 'primary'}
          label='Scenario'
          variant='outlined'
          onClick={() => onTourClick('scenario')}
        />
        <Chip
          icon={<ShowChartIcon />}
          color={tours.lineChart ? 'default' : 'primary'}
          label='Line chart'
          variant='outlined'
          onClick={() => onTourClick('lineChart')}
        />
        <Chip
          icon={<FilterListIcon />}
          color={tours.filter ? 'default' : 'primary'}
          label='Filter'
          variant='outlined'
          onClick={() => onTourClick('filter')}
        />
      </Stack>
      <TourSteps />
    </>
  );
}
