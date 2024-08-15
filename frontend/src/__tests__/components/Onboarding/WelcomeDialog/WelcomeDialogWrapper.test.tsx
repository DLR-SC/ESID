// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import {describe, test, expect} from 'vitest';
import {render, screen, waitFor} from '@testing-library/react';
import {Provider} from 'react-redux';
import {Store} from '../../../../store';
import i18n from '../../../../util/i18nForTests';
import {I18nextProvider} from 'react-i18next';
import WelcomeDialogWrapper from 'components/OnboardingComponents/WelcomeDialog/WelcomeDialogWrapper';
import {setShowWelcomeDialog} from 'store/UserOnboardingSlice';
import Theme from 'util/Theme';
import {ThemeProvider} from '@mui/system';

const WelcomeDialogWrapperTest = () => (
  <ThemeProvider theme={Theme}>
    <Provider store={Store}>
      <I18nextProvider i18n={i18n}>
        <WelcomeDialogWrapper />
      </I18nextProvider>
    </Provider>
  </ThemeProvider>
);

describe('WelcomeDialogWrapper Component', () => {
  test('renders WelcomeDialog when showWelcomeDialog is true', () => {
    Store.dispatch(setShowWelcomeDialog(true));
    render(<WelcomeDialogWrapperTest />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
  test('does not render WelcomeDialog when showWelcomeDialog is false', async () => {
    render(<WelcomeDialogWrapperTest />);
    Store.dispatch(setShowWelcomeDialog(false));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
