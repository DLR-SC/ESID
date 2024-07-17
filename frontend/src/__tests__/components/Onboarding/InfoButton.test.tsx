// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {render, fireEvent, screen, waitFor} from '@testing-library/react';
import {describe, test, expect} from 'vitest';
import {Store} from '../../../store';
import {Provider} from 'react-redux';
import React from 'react';
import InfoButton from '../../../components/OnboardingComponents/InfoButton';
import {setShowTooltip} from '../../../store/UserOnboardingSlice';

describe('InfoButton', () => {
  const renderComponent = () => {
    render(
      <Provider store={Store}>
        <InfoButton />
      </Provider>
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

  test('opens popover when the info button is clicked', () => {
    renderComponent();
    fireEvent.click(screen.getByLabelText('tooltip-info-button'));
    expect(screen.getByLabelText('popover')).toBeInTheDocument();
  });

  test('popover is not open if not clicked', () => {
    renderComponent();
    expect(screen.queryByLabelText('popover')).not.toBeInTheDocument();
  });

  test('closes popover when close button is clicked', async () => {
    renderComponent();

    fireEvent.click(screen.getByLabelText('tooltip-info-button'));
    expect(screen.getByLabelText('popover')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('close-info-button'));
    await waitFor(() => {
      expect(screen.queryByTestId('popover-testid')).not.toBeInTheDocument();
    });
  });
});
