// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {useMemo, useState} from 'react';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {useTranslation} from 'react-i18next';
import {useAppSelector, useAppDispatch} from '../../store/hooks';
import {setShowTooltip, setShowPopover} from '../../store/UserOnboardingSlice';
import TopBarPopover from './TopBarPopover';

/**
 * This component is an information button in the top bar that opens a popover, which contains the onboarding tours which the user can take.
 */
export default function InfoButton() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const dispatch = useAppDispatch();
  const {t: tOnboarding} = useTranslation('onboarding');

  const showTooltip = useAppSelector((state) => state.userOnboarding.showTooltip);
  const showPopover = useAppSelector((state) => state.userOnboarding.showPopover);
  const allToursCompleted = useAppSelector((state) => state.userOnboarding.allToursCompleted);
  const tours = useAppSelector((state) => state.userOnboarding.tours);

  /**
   * This use memo is to calculate the total number of tours and the number of completed tours for the popover progress bar.
   **/
  const [totalTours, completedTours] = useMemo(() => {
    const total = Object.keys(tours).length;
    const completed = Object.values(tours).filter(Boolean).length;
    return [total, completed];
  }, [tours]);

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
        <Badge
          badgeContent={showPopover ? 0 : totalTours - completedTours}
          color='primary'
          sx={{
            '& .MuiBadge-badge': {
              top: '9px',
              right: '9px',
              display: showPopover ? 'none' : 'inline-flex',
            },
          }}
        >
          <IconButton
            aria-label='top-bar-info-button'
            color='primary'
            sx={{textDecoration: 'overline'}}
            onClick={handlePopoverOpen}
            data-testid='info-button'
          >
            <InfoOutlinedIcon sx={{fontSize: '1.6rem'}} />
          </IconButton>
        </Badge>
      </Tooltip>
      {showPopover && (
        <TopBarPopover
          anchorEl={anchorEl}
          open={showPopover}
          onClose={handlePopoverClose}
          allToursCompleted={allToursCompleted || false}
          completedTours={completedTours}
          totalTours={totalTours}
        />
      )}
    </>
  );
}
