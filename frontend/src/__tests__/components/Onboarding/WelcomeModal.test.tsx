// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {render, fireEvent, screen, waitFor} from '@testing-library/react';
import {describe, test, expect} from 'vitest';
import {Store} from '../../../store';
import {I18nextProvider} from 'react-i18next';
import i18n from '../../../util/i18nForTests';
import {Provider} from 'react-redux';
import React from 'react';
import WelcomeDialog from '../../../components/OnboardingComponents/WelcomeDialog';
import {setTourCompleted} from '../../../store/UserOnboardingSlice';

describe('WelcomeDialog', () => {
  const renderComponent = () => {
    render(
      <Provider store={Store}>
        <I18nextProvider i18n={i18n}>
          <WelcomeDialog />
        </I18nextProvider>
      </Provider>
    );
  };

  test('renders correctly when the user is a first time user', () => {
    renderComponent();
    expect(screen.getByLabelText('welcome-modal')).toBeInTheDocument();
  });

  test('goes to the next slide when arrow is clicked', () => {
    renderComponent();
    const arrowForwardButton = screen.getByTestId('arrow-forward-button');
    fireEvent.click(arrowForwardButton);

    expect(screen.getByText('Example title 2')).toBeInTheDocument();
  });

  test('goes to the previous slide when arrow is clicked', () => {
    renderComponent();
    fireEvent.click(screen.getByTestId('arrow-forward-button'));
    fireEvent.click(screen.getByTestId('arrow-backward-button'));

    expect(screen.getByText('Welcome!')).toBeInTheDocument();
  });

  test('modal closes when maybe later button is clicked', async () => {
    renderComponent();

    // we have to click the forward button 4 times to get to the last slide
    fireEvent.click(screen.getByTestId('arrow-forward-button'));
    fireEvent.click(screen.getByTestId('arrow-forward-button'));
    fireEvent.click(screen.getByTestId('arrow-forward-button'));
    fireEvent.click(screen.getByTestId('arrow-forward-button'));

    const maybeLaterButton = screen.getByTestId('maybe-later-button');
    fireEvent.click(maybeLaterButton);

    await waitFor(() => {
      expect(screen.queryByLabelText('welcome-modal')).not.toBeInTheDocument();
    });
  });

  test('does not render when user is not a first time user', () => {
    Store.dispatch(setTourCompleted({tour: 'districtMap', completed: true}));
    renderComponent();
    expect(screen.queryByLabelText('welcome-modal')).not.toBeInTheDocument();
  });
});
