// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {render, fireEvent, screen} from '@testing-library/react';
import {describe, test, expect} from 'vitest';
import {Store} from '../../../store';
import {I18nextProvider} from 'react-i18next';
import i18n from '../../../util/i18nForTests';
import {Provider} from 'react-redux';
import React, {Suspense} from 'react';
import WelcomeDialog from '../../../components/OnboardingComponents/WelcomeDialog';
import {ThemeProvider} from '@mui/system';
import Theme from 'util/Theme';

describe('WelcomeDialog', () => {
  const renderComponent = () => {
    render(
      <ThemeProvider theme={Theme}>
        <Provider store={Store}>
          <I18nextProvider i18n={i18n}>
            <Suspense>
              <WelcomeDialog />
            </Suspense>
          </I18nextProvider>
        </Provider>
      </ThemeProvider>
    );
  };

  test('renders correctly when the user is a first time user', () => {
    renderComponent();
    expect(screen.getByLabelText('welcome-modal')).toBeInTheDocument();
  });

  test('goes to the next slide when forward arrow is clicked', () => {
    renderComponent();
    const arrowForwardButton = screen.getByTestId('arrow-forward-button');
    fireEvent.click(arrowForwardButton);

    expect(screen.getByText('welcomeModalSlides.slide2.title')).toBeInTheDocument();
  });

  test('goes to the previous slide when back arrow is clicked', () => {
    renderComponent();
    fireEvent.click(screen.getByTestId('arrow-forward-button'));
    fireEvent.click(screen.getByTestId('arrow-backward-button'));

    expect(screen.getByText('welcomeModalSlides.slide1.title')).toBeInTheDocument();
  });

  test('does not render if close button is clicked', () => {
    renderComponent();
    fireEvent.click(screen.getByTestId('CloseIcon'));
    expect(screen.queryByLabelText('welcome-modal')).not.toBeInTheDocument();
  });
});
