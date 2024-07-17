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
import {setTourCompleted, setShowTooltip} from '../../store/UserOnboardingSlice';
import {useAppDispatch, useAppSelector} from '../../store/hooks';
import TourChips from './TourComponents/TourChips';

/**
 * This component is a welcome modal that is shown to the user when they first open the application.
 * It contains a series of slides that explain the basic functionality of the application.
 * at the last slide, the user can choose a tour to start or skip it altogether.
 */
const slides = [
  {
    title: 'Welcome!',
    content:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl ac lacinia tincidunt, nunc nunc tincidunt tellus, id lacinia nunc nunc vitae nunc. Sed euismod, nisl ac lacinia tincidunt, nunc nunc tincidunt tellus, id lacinia nunc nunc vitae nunc.',
  },
  {
    title: 'Example title 2',
    content:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl ac lacinia tincidunt, nunc nunc tincidunt tellus, id lacinia nunc nunc vitae nunc. Sed euismod, nisl ac lacinia tincidunt, nunc nunc tincidunt tellus, id lacinia nunc nunc vitae nunc.',
  },
  {
    title: 'Example title 3',
    content:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl ac lacinia tincidunt, nunc nunc tincidunt tellus, id lacinia nunc nunc vitae nunc. Sed euismod, nisl ac lacinia tincidunt, nunc nunc tincidunt tellus, id lacinia nunc nunc vitae nunc.',
  },
  {
    title: 'Example title 4',
    content:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl ac lacinia tincidunt, nunc nunc tincidunt tellus, id lacinia nunc nunc vitae nunc. Sed euismod, nisl ac lacinia tincidunt, nunc nunc tincidunt tellus, id lacinia nunc nunc vitae nunc.',
  },
  {
    title: 'Example title 5',
    content:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl ac lacinia tincidunt, nunc nunc tincidunt tellus, id lacinia nunc nunc vitae nunc. Sed euismod, nisl ac lacinia tincidunt, nunc nunc tincidunt tellus, id lacinia nunc nunc vitae nunc.',
  },
];

export default function WelcomeModal(): JSX.Element {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [step, setStep] = useState(0);
  const tours = useAppSelector((state) => state.userOnboarding.tours);

  useEffect(() => {
    // this effect checks if the user has already taken at least one tour, if not, the welcome modal is shown
    const isUserFirstTime = Object.values(tours).every((tour) => tour === null);
    if (isUserFirstTime) {
      setShowWelcomeModal(true);
    }
  }, [tours]);

  // these functions handle next and previous buttons in the modal
  const handleNext = () => setStep((prev) => prev + 1);

  const handlePrev = () => setStep((prev) => prev - 1);

  // this function handles the close button of the modal and after shows the tooltip over the information button
  const handleClose = (showTooltip: boolean) => {
    setShowWelcomeModal(false);
    if (showTooltip) {
      dispatch(setShowTooltip(true));
    }
    // when the modal is closed and the user didn't choose to do any tour, we set the tour states to false to prevent the modal from showing again
    Object.keys(tours).forEach((tourKey) => {
      if (tours[tourKey as keyof typeof tours] === null) {
        dispatch(setTourCompleted({tour: tourKey as keyof typeof tours, completed: false}));
      }
    });
  };

  // TODO: this is not yet implemented with joyride library, for now it is a simple function that sets each tour to completed when the corresponding chip is clicked
  const handleTourClick = (tour: keyof typeof tours) => {
    dispatch(setTourCompleted({tour, completed: true}));
  };

  return (
    <Dialog
      aria-label='welcome-modal'
      open={showWelcomeModal}
      onClose={() => handleClose(true)}
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
          <Typography variant='h1'>{slides[step].title} </Typography>
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
          {slides[step].content}
        </Typography>
      </DialogContent>
      {step === slides.length - 1 && (
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
          <TourChips onTourClick={handleTourClick} />
          <Button
            data-testid='maybe-later-button'
            onClick={() => handleClose(true)}
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
          steps={slides.length}
          position='static'
          activeStep={step}
          sx={{
            flexGrow: 1,
            maxWidth: '100%',
            backgroundColor: 'transparent',
          }}
          nextButton={
            step < slides.length - 1 ? (
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
}
