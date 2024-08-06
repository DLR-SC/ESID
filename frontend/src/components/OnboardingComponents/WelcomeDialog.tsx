// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useTheme} from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import MobileStepper from '@mui/material/MobileStepper';
import ArrowBackIos from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIos from '@mui/icons-material/ArrowForwardIos';
import esidLogo from '../../../assets/logo/logo-200x66.svg';
import TourChips from './TourComponents/TourChipsList';
import {Trans} from 'react-i18next/TransWithoutContext';
import {useAppSelector, useAppDispatch} from '../../store/hooks';
import {setTourCompleted, setShowTooltip, setShowWelcomeDialog} from '../../store/UserOnboardingSlice';
import {useTranslation} from 'react-i18next';

/**
 * This component is a welcome modal that is shown to the user when they first open the application.
 * It contains a series of slides that explain the basic functionality of the application.
 * at the last slide, the user can choose a tour to start or skip it altogether.
 */

export default function WelcomeDialog(): JSX.Element {
  const theme = useTheme();
  const [step, setStep] = useState(0);
  const showWelcomeDialog = useAppSelector((state) => state.userOnboarding.showWelcomeDialog);

  const dispatch = useAppDispatch();
  const tours = useAppSelector((state) => state.userOnboarding.tours);
  const {t: tOnboarding} = useTranslation('onboarding');

  /**
   * this useMemo hook gets the keys of the slides to calculate the number of slides
   */
  const slideKeys = useMemo(() => Object.keys(tOnboarding('welcomeModalSlides', {returnObjects: true})), [tOnboarding]);
  const numberOfSlides = slideKeys.length;

  /**
   * this effect checks if the user has already taken at least one tour, if not, the welcome modal is shown
   */
  useEffect(() => {
    const isUserFirstTime = Object.values(tours).every((tour) => tour === null);
    if (isUserFirstTime) {
      dispatch(setShowWelcomeDialog(true));
    }
  }, [dispatch, tours]);

  /**
   * this function handles the next button of the modal
   */
  const handleNext = () => setStep((prev) => prev + 1);
  const handlePrev = () => setStep((prev) => prev - 1);

  /**
   * this function handles the closing of the modal and after shows the tooltip over the information button
   */
  const handleClose = useCallback(() => {
    dispatch(setShowWelcomeDialog(false));
    dispatch(setShowTooltip(true));
    Object.keys(tours).forEach((tourKey) => {
      if (tours[tourKey as keyof typeof tours] === null) {
        dispatch(setTourCompleted({tour: tourKey as keyof typeof tours, completed: false}));
      }
    });
  }, [dispatch, tours]);

  if (showWelcomeDialog) {
    return (
      <Dialog
        aria-label='welcome-modal'
        open={showWelcomeDialog}
        onClose={() => handleClose()}
        maxWidth='sm'
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            height: '600px',
            padding: theme.spacing(4),
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        <Box
          sx={{
            flex: '1 1 50%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <img
            src={esidLogo}
            alt='Illustration'
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'cover',
            }}
          />
        </Box>
        <DialogTitle>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              height: '100%',
              minHeight: '50px',
            }}
          >
            <Typography variant='h1'>{tOnboarding(`welcomeModalSlides.slide${step + 1}.title`)} </Typography>
          </Box>
        </DialogTitle>
        <DialogContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            height: '100%',
          }}
        >
          <Typography variant='body1' paragraph>
            <Trans> {tOnboarding(`welcomeModalSlides.slide${step + 1}.content`)}</Trans>
          </Typography>

          {step === numberOfSlides - 1 && (
            <>
              <Box sx={{display: 'flex', justifyContent: 'center', padding: theme.spacing(2)}}>
                <TourChips />
              </Box>
              <Button
                data-testid='maybe-later-button'
                onClick={() => handleClose()}
                sx={{mr: theme.spacing(2)}}
                variant='text'
                color='secondary'
              >
                {tOnboarding(`maybeLater`)}
              </Button>
            </>
          )}
        </DialogContent>
        <Box sx={{display: 'flex', justifyContent: 'center', padding: theme.spacing(2)}}>
          <MobileStepper
            variant='dots'
            steps={numberOfSlides}
            position='static'
            activeStep={step}
            sx={{
              backgroundColor: 'transparent',
            }}
            nextButton={
              step < numberOfSlides - 1 ? (
                <Button onClick={handleNext} data-testid='arrow-forward-button'>
                  <ArrowForwardIos />
                </Button>
              ) : (
                <Button disabled>
                  <ArrowForwardIos />
                </Button>
              )
            }
            backButton={
              step > 0 ? (
                <Button onClick={handlePrev} data-testid='arrow-backward-button'>
                  <ArrowBackIos />
                </Button>
              ) : (
                <Button disabled>
                  <ArrowBackIos />
                </Button>
              )
            }
          />
        </Box>
      </Dialog>
    );
  } else {
    return (
      <Box sx={{display: 'none'}}>
        <TourChips />
      </Box>
    );
  }
}
