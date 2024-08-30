// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import {Box, Button, Dialog, MobileStepper} from '@mui/material';
import {ArrowBackIos, ArrowForwardIos, Close as CloseIcon} from '@mui/icons-material';
import {useTheme} from '@mui/material/styles';
import Slide from './Slide';
import TourChips from '../TourComponents/TourChipsList';
import LanguagePicker from 'components/TopBar/LanguagePicker';

interface WelcomeDialogProps {
  /** determines if the dialog is open or not */
  open: boolean;

  /** the current step of the dialog */
  step: number;

  /** function to close the dialog */
  onClose: () => void;

  /** function to go to the next step */
  onNext: () => void;

  /** function to go to the previous step */
  onPrev: () => void;

  /** the total number of slides in the dialog */
  numberOfSlides: number;

  /** an object containing the image sources for each slide */
  images: {[key: number]: string};

  /** the title of the current slide */
  title: string;

  /** the content of the current slide */
  content: string;

  /** determines if the tour chips should be shown */
  showTourChips: boolean;

  /** determines if the language picker should be shown */
  showLanguagePicker: boolean;

  /** the text for the maybe later button */
  maybeLaterText: string;
}

/**
 * This component is a welcome modal that is shown to the user when they first open the application.
 * It contains a series of slides that explain the basic functionality of the application.
 * at the last slide, the user can choose a tour to start or skip it altogether.
 */
export default function WelcomeDialog({
  open,
  step,
  onClose,
  onNext,
  onPrev,
  numberOfSlides,
  images,
  title,
  content,
  showTourChips,
  showLanguagePicker,
  maybeLaterText,
}: WelcomeDialogProps): JSX.Element {
  const theme = useTheme();

  if (open) {
    return (
      <Dialog
        aria-label='welcome-modal'
        open={open}
        onClose={onClose}
        maxWidth='sm'
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            height: '610px',
            padding: theme.spacing(4),
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
          },
        }}
      >
        <Button
          data-testid='close-button'
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: theme.spacing(2),
            right: theme.spacing(2),
            color: theme.palette.text.secondary,
          }}
        >
          <CloseIcon />
        </Button>
        <Box sx={{display: 'flex', justifyContent: 'center', minHeight: '40px'}}>
          {showLanguagePicker && <LanguagePicker />}
        </Box>
        <Slide step={step} title={title} content={content} imageSrc={images[step]} />
        <>
          {showTourChips && (
            <>
              <Box sx={{display: 'flex', justifyContent: 'center'}}>
                <TourChips align='center' />
              </Box>
              <Box sx={{display: 'flex', justifyContent: 'center'}}>
                <Button
                  data-testid='maybe-later-button'
                  sx={{marginTop: theme.spacing(2)}}
                  onClick={onClose}
                  variant='text'
                  color='secondary'
                >
                  {maybeLaterText}
                </Button>
              </Box>
            </>
          )}
        </>
        <Box sx={{display: 'flex', justifyContent: 'center', padding: theme.spacing(1)}}>
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
                <Button onClick={onNext} data-testid='arrow-forward-button'>
                  <ArrowForwardIos />
                </Button>
              ) : (
                <Button disabled data-testid='arrow-forward-button'>
                  <ArrowForwardIos />
                </Button>
              )
            }
            backButton={
              step > 0 ? (
                <Button onClick={onPrev} data-testid='arrow-backward-button'>
                  <ArrowBackIos />
                </Button>
              ) : (
                <Button disabled data-testid='arrow-backward-button'>
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
