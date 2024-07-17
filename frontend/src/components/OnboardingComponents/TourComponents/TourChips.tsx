import React from 'react';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import MapIcon from '@mui/icons-material/Map';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import FilterListIcon from '@mui/icons-material/FilterList';
import {useAppSelector} from '../../../store/hooks';
import {useTheme} from '@mui/material/styles';
import {TourType} from '../../../types/tours';

/**
 * this component is a row of chips that represent the tours that the user can take
 */

// interface to define the props for the TourChips component
interface TourChipsProps {
  onTourClick: (tour: TourType) => void;
}

export default function TourChips({onTourClick}: TourChipsProps): JSX.Element {
  const theme = useTheme();
  const tours = useAppSelector((state) => state.userOnboarding.tours);

  return (
    <Stack
      direction='row'
      spacing={1}
      sx={{
        display: 'flex',
        justifyContent: 'center',
        padding: theme.spacing(2),
      }}
    >
      {/* when clicked on a chip, it changes to green color. This is a temporary fix for now to simulate a completion of the tour, once the tour is 
      implemented with joyride, it will be based on if the user completed the tour or not */}
      <Chip
        icon={<MapIcon />}
        color={tours.districtMap ? 'success' : 'primary'}
        label='District map'
        variant='outlined'
        onClick={() => onTourClick('districtMap')}
      />
      <Chip
        icon={<DashboardIcon />}
        color={tours.scenario ? 'success' : 'primary'}
        label='Scenario'
        variant='outlined'
        onClick={() => onTourClick('scenario')}
      />
      <Chip
        icon={<ShowChartIcon />}
        color={tours.lineChart ? 'success' : 'primary'}
        label='Line chart'
        variant='outlined'
        onClick={() => onTourClick('lineChart')}
      />
      <Chip
        icon={<FilterListIcon />}
        color={tours.filter ? 'success' : 'primary'}
        label='Filter'
        variant='outlined'
        onClick={() => onTourClick('filter')}
      />
    </Stack>
  );
}
