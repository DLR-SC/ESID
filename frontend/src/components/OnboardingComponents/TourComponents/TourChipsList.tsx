// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {lazy, Suspense, useCallback, useMemo} from 'react';
import MapIcon from '@mui/icons-material/Map';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import FilterListIcon from '@mui/icons-material/FilterList';
import Coronavirus from '@mui/icons-material/Coronavirus';
import {useAppDispatch, useAppSelector} from '../../../store/hooks';
import {TourType} from '../../../types/tours';
import {setShowWelcomeDialog, setShowPopover, setActiveTour} from '../../../store/UserOnboardingSlice';
import {useTranslation} from 'react-i18next';
import Box from '@mui/material/Box';
import TourChip from './TourChip';

/** Lazy loading the tour steps */
const TourSteps = lazy(() => import('./TourSteps'));

interface TourChipsProps {
  /** The alignment of the chips, which varies between the components where they are rendered (welcome dialog and top bar popover). */
  align?: 'center' | 'left';
}

/**
 * This component is a list of chips that represent the tours that the user can take
 */
export default function TourChips({align = 'left'}: TourChipsProps): JSX.Element {
  const dispatch = useAppDispatch();
  const {t: tOnboarding} = useTranslation('onboarding');
  const tours = useAppSelector((state) => state.userOnboarding.tours);

  /**
   * This is the memoized data for the tours that the user can take.
   */
  const tourData = useMemo(
    () => [
      {type: 'districtMap', icon: <MapIcon />, title: 'tours.districtMap.title'},
      {type: 'scenario', icon: <DashboardIcon />, title: 'tours.scenario.title'},
      {type: 'filter', icon: <FilterListIcon />, title: 'tours.filter.title'},
      {type: 'lineChart', icon: <ShowChartIcon />, title: 'tours.lineChart.title'},
      {type: 'parameters', icon: <Coronavirus />, title: 'tours.parameters.title'},
    ],
    []
  );

  /**
   * This function is called when a tour is clicked and sets the current active tour.
   */
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
      <Box
        display='flex'
        flexWrap='wrap'
        justifyContent={align === 'center' ? 'center' : 'flex-start'}
        gap={2}
        sx={{
          maxWidth: '90%',
        }}
      >
        {tourData.map(({type, icon, title}) => (
          <Box key={type} mb={2}>
            <TourChip
              icon={icon}
              tourType={type as TourType}
              isCompleted={!!tours[type as TourType]}
              label={tOnboarding(title)}
              onClick={onTourClick}
            />
          </Box>
        ))}
      </Box>
      <Suspense fallback={<div>Loading...</div>}>
        <TourSteps />
      </Suspense>
    </>
  );
}
