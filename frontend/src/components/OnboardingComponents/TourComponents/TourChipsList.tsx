// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {useCallback} from 'react';
import MapIcon from '@mui/icons-material/Map';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import FilterListIcon from '@mui/icons-material/FilterList';
import Coronavirus from '@mui/icons-material/Coronavirus';
import {useAppDispatch, useAppSelector} from '../../../store/hooks';
import {TourType} from '../../../types/tours';
import TourSteps from './TourSteps';
import {setShowWelcomeDialog, setShowPopover, setActiveTour} from '../../../store/UserOnboardingSlice';
import {useTranslation} from 'react-i18next';
import {Box} from '@mui/material';
import TourChip from './TourChip';

const tourData = [
  {type: 'districtMap', icon: <MapIcon />, title: 'tours.districtMap.title'},
  {type: 'scenario', icon: <DashboardIcon />, title: 'tours.scenario.title'},
  {type: 'filter', icon: <FilterListIcon />, title: 'tours.filter.title'},
  {type: 'lineChart', icon: <ShowChartIcon />, title: 'tours.lineChart.title'},
  {type: 'parameters', icon: <Coronavirus />, title: 'tours.parameters.title'},
];

/**
 * This component is a list of chips that represent the tours that the user can take
 */
export default function TourChips(): JSX.Element {
  const dispatch = useAppDispatch();
  const {t: tOnboarding} = useTranslation('onboarding');
  const tours = useAppSelector((state) => state.userOnboarding.tours);

  const onTourClick = useCallback(
    (tour: TourType) => {
      dispatch(setShowWelcomeDialog(false));
      dispatch(setShowPopover(false));
      dispatch(setActiveTour(tour));
    },
    [dispatch]
  );

  return (
    <>
      <Box display='flex' flexWrap='wrap' justifyContent='left' gap={2}>
        {tourData.map(({type, icon, title}) => (
          <Box key={type} mb={2}>
            <TourChip
              icon={icon}
              tourType={type as TourType}
              color={tours[type as TourType] ? 'default' : 'primary'}
              label={tOnboarding(title)}
              onClick={onTourClick}
            />
          </Box>
        ))}
      </Box>
      <TourSteps />
    </>
  );
}
