// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MobileStepper from '@mui/material/MobileStepper';
import CloseIcon from '@mui/icons-material/Close';
import {useTheme} from '@mui/material/styles';
import Slide from './Slide';
import TourChips from '../TourComponents/TourChipsList';
import LanguagePicker from 'components/TopBar/LanguagePicker';
import StepButton from './StepButton';

interface WelcomeDialogProps {
  /** Determines if the dialog is open or not */
  open: boolean;

  /** The current step of the dialog */
  step: number;

  /** Function to close the dialog */
  onClose: () => void;

  /** Function to go to the next step */
  onNext: () => void;

  /** Function to go to the previous step */
  onPrev: () => void;

  /** The total number of slides in the dialog */
  numberOfSlides: number;

  /** An object containing the image sources for each slide */
  images: {[key: number]: string};

  /** The title of the current slide */
  title: string;

  /** The content of the current slide */
  content: string;

  /** Determines if the tour chips should be shown */
  showTourChips: boolean;

  /** Determines if the language picker should be shown */
  showLanguagePicker: boolean;

  /** The text for the maybe later button */
  maybeLaterText: string;
}

/**
 * This component is a welcome modal that is shown to the user when they first open the application.
 * It contains a series of slides that explain the basic functionality of the application.
 * At the last slide, the user can choose a tour to start or skip it altogether.
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
          aria-label='close-button'
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
                  aria-label='maybe-later-button'
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
            nextButton={<StepButton direction='next' onClick={onNext} disabled={step >= numberOfSlides - 1} />}
            backButton={<StepButton direction='back' onClick={onPrev} disabled={step <= 0} />}
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
