// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {useMemo} from 'react';
import Popover from '@mui/material/Popover';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import {useTranslation} from 'react-i18next';
import TourChipsList from './TourComponents/TourChipsList';
import LinearProgress from '@mui/material/LinearProgress';

interface TopBarPopoverProps {
  /** The anchor element for the popover */
  anchorEl: HTMLElement | null;

  /** Determines if the popover is open or not */
  open: boolean;

  /** Function to close the popover */
  onClose: () => void;

  /** Determines if all tours are completed */
  allToursCompleted: boolean;

  /** The number of completed tours */
  completedTours: number;

  /** The total number of tours */
  totalTours: number;
}

/**
 * This component is a popover that contains the onboarding tours which the user can take, it is rendered when the user clicks the information button in the top bar.
 */
export default function TopBarPopover(props: TopBarPopoverProps): JSX.Element {
  const {t: tOnboarding} = useTranslation('onboarding');

  /**
   * This use memo is to calculate the completion percentage of the tours for the progress bar.
   */
  const completionPercentage = useMemo(() => {
    return props.totalTours > 0 ? (props.completedTours / props.totalTours) * 100 : 0;
  }, [props.completedTours, props.totalTours]);

  return (
    <Popover
      aria-label='top-bar-popover'
      data-testid='popover-testid'
      open={props.open}
      anchorEl={props.anchorEl}
      onClose={props.onClose}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      sx={{
        '& .MuiPopover-paper': {
          width: 600,
        },
      }}
    >
      <Box position='relative' p={4}>
        <Typography variant='h2' align='left' gutterBottom>
          {props.allToursCompleted ? tOnboarding('completedTours') : tOnboarding('getStarted')}
        </Typography>
        <Typography variant='body1' align='left' gutterBottom sx={{color: 'GrayText'}}>
          {props.allToursCompleted ? tOnboarding('completedToursContent') : tOnboarding('getStartedContent')}
        </Typography>
        <IconButton
          aria-label='close'
          test-id='close-info-button'
          onClick={props.onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon data-testid='close-info-button' />
        </IconButton>
        <Box mt={4}>
          <TourChipsList />
        </Box>
        <Box mt={4}>
          <LinearProgress
            aria-label='onboarding-completion-progress'
            variant='determinate'
            value={completionPercentage}
            sx={{
              height: 10,
              borderRadius: 5,
              backgroundColor: '#e0e0e0',
              '& .MuiLinearProgress-bar': {
                borderRadius: 5,
                backgroundColor: 'primary',
              },
            }}
          />
          <Typography variant='body2' align='left' sx={{color: 'GrayText', mt: 1}}>
            {Math.round(completionPercentage)}% {tOnboarding('completed')}
          </Typography>
        </Box>
      </Box>
    </Popover>
  );
}
