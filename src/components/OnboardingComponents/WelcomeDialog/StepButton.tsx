// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import Button from '@mui/material/Button';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';

interface StepButtonProps {
  /** The direction of the button */
  direction: 'next' | 'back';

  /** Function to be called when the button is clicked */
  onClick: () => void;

  /** Determines if the button should be disabled */
  disabled: boolean;
}

/**
 * This component is a button that takes in a direction, onClick function, and a disabled prop and renders a button with an arrow icon.
 * It is used in the WelcomeDialog component to navigate between slides.
 */
export default function StepButton({direction, onClick, disabled}: StepButtonProps): JSX.Element {
  return (
    <Button
      onClick={onClick}
      aria-label={direction === 'next' ? 'arrow-forward-button' : 'arrow-backward-button'}
      data-testid={direction === 'next' ? 'arrow-forward-button' : 'arrow-backward-button'}
      disabled={disabled}
    >
      {direction === 'next' ? <ArrowForwardIosIcon /> : <ArrowBackIosIcon />}
    </Button>
  );
}
