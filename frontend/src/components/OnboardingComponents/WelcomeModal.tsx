// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {useEffect, useState} from 'react';
import {useTheme} from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import MobileStepper from '@mui/material/MobileStepper';
import ArrowBackIos from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIos from '@mui/icons-material/ArrowForwardIos';
import esidLogo from '../../../assets/logo/logo-200x66.svg';
import TourChips from './TourComponents/TourChips';
import {Trans} from 'react-i18next/TransWithoutContext';
import {useAppSelector, useAppDispatch} from '../../store/hooks';
import {setTourCompleted, setShowTooltip, setModalTour} from '../../store/UserOnboardingSlice';
import slidesData from '../../../assets/welcomeModalSlides.json';
import {Slide} from '../../types/slide';

/**
 * This component is a welcome modal that is shown to the user when they first open the application.
 * It contains a series of slides that explain the basic functionality of the application.
 * at the last slide, the user can choose a tour to start or skip it altogether.
 */

export default function WelcomeModal(): JSX.Element {
  const theme = useTheme();
  const [step, setStep] = useState(0);
  const [onboardingSlides, setOnboardingSlides] = useState<Slide[]>([]);
  const showModal = useAppSelector((state) => state.userOnboarding.showModal);

  const dispatch = useAppDispatch();
  const tours = useAppSelector((state) => state.userOnboarding.tours);
  const slides: Slide[] = slidesData as unknown as Slide[];

  useEffect(() => {
    // this effect initializes slides from the JSON file
    setOnboardingSlides(slides);
  }, [slides]);

  useEffect(() => {
    // this effect checks if the user has already taken at least one tour, if not, the welcome modal is shown
    const isUserFirstTime = Object.values(tours).every((tour) => tour === null);
    if (isUserFirstTime) {
      dispatch(setModalTour(true));
    }
  }, [dispatch, tours]);

  // these functions handle next and previous buttons in the modal
  const handleNext = () => setStep((prev) => prev + 1);

  const handlePrev = () => setStep((prev) => prev - 1);

  // this function handles the closing of the modal and after shows the tooltip over the information button
  const handleClose = () => {
    dispatch(setModalTour(false));
    dispatch(setShowTooltip(true));

    // when the modal is closed and the user didn't choose to do any tour, we set the tour states to false to prevent the modal from showing again
    Object.keys(tours).forEach((tourKey) => {
      console.log('handle close of welcome modal');
      if (tours[tourKey as keyof typeof tours] === null) {
        dispatch(setTourCompleted({tour: tourKey as keyof typeof tours, completed: false}));
        console.log('is tour completed: ', tours[tourKey as keyof typeof tours]);
        console.log('tour name: ', tourKey);
      }
    });
  };

  if (showModal) {
    return (
      <Dialog
        aria-label='welcome-modal'
        open={showModal}
        onClose={() => handleClose()}
        maxWidth='sm'
        fullWidth={false}
        sx={{
          '& .MuiDialog-paper': {
            width: '600px',
            height: '650px',
          },
        }}
      >
        <DialogTitle>
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: theme.spacing(3),
            }}
          ></Box>
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: theme.spacing(3),
            }}
          >
            <img src={esidLogo} alt='Illustration' />
          </Box>
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
            <Typography variant='h1'>{onboardingSlides[step]?.title} </Typography>
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
            <Trans> {onboardingSlides[step]?.content}</Trans>
          </Typography>
        </DialogContent>
        {step === onboardingSlides.length - 1 && (
          <>
            <DialogActions
              sx={{
                display: 'flex',
                justifyContent: 'center',
                padding: theme.spacing(2),
              }}
            ></DialogActions>
            <Typography
              variant='body1'
              paragraph
              sx={{
                display: 'flex',
                justifyContent: 'center',
                padding: theme.spacing(2),
              }}
            >
              Choose a tour
            </Typography>
            <TourChips />
            <Button
              data-testid='maybe-later-button'
              onClick={() => handleClose()}
              sx={{mr: theme.spacing(2)}}
              variant='text'
              color='secondary'
            >
              Maybe Later
            </Button>
          </>
        )}

        <Box sx={{display: 'flex', justifyContent: 'center', padding: theme.spacing(2)}}>
          <MobileStepper
            variant='dots'
            steps={onboardingSlides.length}
            position='static'
            activeStep={step}
            sx={{
              flexGrow: 1,
              maxWidth: '100%',
              backgroundColor: 'transparent',
            }}
            nextButton={
              step < onboardingSlides.length - 1 ? (
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
