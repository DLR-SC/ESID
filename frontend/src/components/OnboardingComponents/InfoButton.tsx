// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {useState} from 'react';
import Popover from '@mui/material/Popover';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import {useAppSelector, useAppDispatch} from '../../store/hooks';
import {setShowTooltip, setShowPopover} from '../../store/UserOnboardingSlice';
import IconButton from '@mui/material/IconButton';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import TourChips from './TourComponents/TourChips';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
import {useTranslation} from 'react-i18next';

/**
 * this component is an information button in the top bar that opens a popover, which contains the onboarding tours which the user can take
 */
export default function InfoButton() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const showTooltip = useAppSelector((state) => state.userOnboarding.showTooltip);
  const showPopover = useAppSelector((state) => state.userOnboarding.showPopover);
  const allToursCompleted = useAppSelector((state) => state.userOnboarding.allToursCompleted);
  const {t: tOnboarding} = useTranslation('onboarding');

  const dispatch = useAppDispatch();

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    dispatch(setShowPopover(true));
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
    dispatch(setShowPopover(false));
  };

  const handleTooltipClose = () => {
    dispatch(setShowTooltip(false));
  };

  return (
    <>
      <Tooltip
        title={tOnboarding(`toolTipText`)}
        aria-label='tooltip-info-button'
        onClose={handleTooltipClose}
        arrow
        placement='bottom-end'
        open={showTooltip}
        data-testid='tooltip'
        sx={{
          '& .MuiTooltip-tooltip': {
            backgroundColor: 'white',
            color: 'black',
            fontSize: '1em',
          },
          '& .MuiTooltip-arrow': {
            color: 'white',
          },
        }}
      >
        <IconButton
          color='primary'
          sx={{textDecoration: 'overline'}}
          onClick={handlePopoverOpen}
          data-testid='info-button'
        >
          <InfoOutlinedIcon />
        </IconButton>
      </Tooltip>
      {showPopover && (
        <Popover
          aria-label='popover'
          data-testid='popover-testid'
          open={true}
          anchorEl={anchorEl}
          onClose={handlePopoverClose}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <Box position='relative' p={4}>
            {allToursCompleted ? (
              <>
                <Typography variant='h2' align='center' gutterBottom>
                  {tOnboarding(`congrats`)}
                </Typography>
                <Typography variant='body1' align='center' gutterBottom>
                  {tOnboarding(`congratsContent`)}
                </Typography>
              </>
            ) : (
              <>
                <Typography variant='h2' align='center' gutterBottom>
                  {tOnboarding(`getStarted`)}
                </Typography>
                <Typography variant='body1' align='center' gutterBottom>
                  {tOnboarding(`getStartedContent`)}
                </Typography>
              </>
            )}

            <IconButton
              aria-label='close-info-button'
              onClick={handlePopoverClose}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
              }}
            >
              <CloseIcon />
            </IconButton>
            <TourChips />
            <Box mt={4}></Box>
          </Box>
        </Popover>
      )}
    </>
  );
}
