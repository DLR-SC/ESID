// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {render, fireEvent, screen, waitFor} from '@testing-library/react';
import {describe, test, expect} from 'vitest';
import {Store} from '../../../store';
import {Provider} from 'react-redux';
import React from 'react';
import InfoButton from '../../../components/OnboardingComponents/InfoButton';
import {setShowTooltip} from '../../../store/UserOnboardingSlice';
import {ThemeProvider} from '@mui/system';
import Theme from 'util/Theme';

describe('InfoButton', () => {
  const renderComponent = () => {
    render(
      <ThemeProvider theme={Theme}>
        <Provider store={Store}>
          <InfoButton />
        </Provider>
      </ThemeProvider>
    );
  };

  test('info button renders correctly', () => {
    renderComponent();
    expect(screen.getByTestId('info-button')).toBeInTheDocument();
  });

  test('shows tooltip when showTooltip is true', async () => {
    Store.dispatch(setShowTooltip(true));
    renderComponent();
    await waitFor(() => expect(screen.getByLabelText('tooltip-info-button')).toBeInTheDocument());
  });

  test('popover is not open if not clicked', () => {
    renderComponent();
    expect(screen.queryByLabelText('popover')).not.toBeInTheDocument();
  });

  test('opens popover when the info button is clicked', async () => {
    renderComponent();
    fireEvent.click(screen.getByTestId('info-button'));
    await waitFor(() => {
      expect(screen.getByTestId('popover-testid')).toBeInTheDocument();
    });
  });

  test('closes popover when close button is clicked', async () => {
    renderComponent();
    fireEvent.click(screen.getByTestId('info-button'));
    await waitFor(() => {
      expect(screen.getByTestId('popover-testid')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId('close-info-button'));
    await waitFor(() => {
      expect(screen.queryByTestId('popover-testid')).not.toBeInTheDocument();
    });
  });
});
