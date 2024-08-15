// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import {describe, test, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import {ThemeProvider} from '@mui/system';
import Theme from 'util/Theme';
import WelcomeDialog from 'components/OnboardingComponents/WelcomeDialog/WelcomeDialog';
import userEvent from '@testing-library/user-event';
import {Provider} from 'react-redux';
import {Store} from '../../../../store';

const handleClose = vi.fn();
const handleNext = vi.fn();
const handlePrev = vi.fn();

const WelcomeDialogTest = ({step = 1}: {step?: number}) => (
  <ThemeProvider theme={Theme}>
    <Provider store={Store}>
      <WelcomeDialog
        open={true}
        step={step}
        onClose={handleClose}
        onNext={handleNext}
        onPrev={handlePrev}
        numberOfSlides={6}
        images={{
          0: 'test-image-0.png',
          1: 'test-image-1.png',
          2: 'test-image-2.png',
        }}
        title='Test Title'
        content='Test Content'
        showTourChips={true}
        maybeLaterText='Maybe Later'
      />
    </Provider>
  </ThemeProvider>
);

describe('WelcomeDialog Component', () => {
  test('renders the dialog when open prop is true', () => {
    render(<WelcomeDialogTest />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  test('renders the close button', () => {
    render(<WelcomeDialogTest />);
    expect(screen.getByTestId('close-button')).toBeInTheDocument();
  });

  test('renders the slide title and content', () => {
    render(<WelcomeDialogTest />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  test('dialog closes when maybe later button is clicked', async () => {
    render(<WelcomeDialogTest />);
    const maybeLaterButton = screen.getByTestId('maybe-later-button');
    expect(maybeLaterButton).toHaveTextContent('Maybe Later');
    await userEvent.click(maybeLaterButton);
    expect(handleClose).toHaveBeenCalled();
  });

  test('goes to the next slide when forward arrow is clicked', async () => {
    render(<WelcomeDialogTest />);
    const nextButton = screen.getByTestId('arrow-forward-button');
    expect(nextButton).toBeInTheDocument();
    await userEvent.click(nextButton);
    expect(handleNext).toHaveBeenCalledTimes(1);
  });

  test('goes to the previous slide when back arrow is clicked', async () => {
    render(<WelcomeDialogTest />);
    const prevButton = screen.getByTestId('arrow-backward-button');
    expect(prevButton).toBeInTheDocument();
    await userEvent.click(prevButton);
    expect(handlePrev).toHaveBeenCalledTimes(1);
  });

  test('disables the next arrow button on the last slide', () => {
    render(<WelcomeDialogTest step={5} />);
    expect(screen.getByTestId('arrow-forward-button')).toBeDisabled();
  });

  test('disables the previous arrow button on the first slide', () => {
    render(<WelcomeDialogTest step={0} />);
    expect(screen.getByTestId('arrow-backward-button')).toBeDisabled();
  });

  test('renders the tour chips on the last slide if showTourChips is true', () => {
    render(<WelcomeDialogTest step={5} />);
    const tourChips = screen.getByRole('button', {name: /tours\.districtMap\.title/i});
    expect(tourChips).toBeInTheDocument();
  });
});
