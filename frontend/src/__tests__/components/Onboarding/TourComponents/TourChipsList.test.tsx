// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import {describe, test, expect} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import {ThemeProvider} from '@mui/material/styles';
import Theme from 'util/Theme';
import {Provider} from 'react-redux';
import {I18nextProvider} from 'react-i18next';
import {Store} from '../../../../store';
import i18n from '../../../../util/i18nForTests';
import TourChipsList from '../../../../components/OnboardingComponents/TourComponents/TourChipsList';

const TourChipsTest = (align: 'center' | 'left' = 'left') => (
  <ThemeProvider theme={Theme}>
    <Provider store={Store}>
      <I18nextProvider i18n={i18n}>
        <TourChipsList align={align} />
      </I18nextProvider>
    </Provider>
  </ThemeProvider>
);

describe('TourChips Component', () => {
  test('renders the tour chips with correct icons and labels', () => {
    render(TourChipsTest());
    expect(screen.getByText('tours.districtMap.title')).toBeInTheDocument();
    expect(screen.getByText('tours.scenario.title')).toBeInTheDocument();
    expect(screen.getByText('tours.filter.title')).toBeInTheDocument();
    expect(screen.getByText('tours.lineChart.title')).toBeInTheDocument();
    expect(screen.getByText('tours.parameters.title')).toBeInTheDocument();
  });

  test('dispatches correct actions in store when a tour chip is clicked', () => {
    render(TourChipsTest());
    fireEvent.click(screen.getByText('tours.districtMap.title'));

    const state = Store.getState().userOnboarding;
    expect(state.showWelcomeDialog).toBe(false);
    expect(state.showPopover).toBe(false);
    expect(state.activeTour).toBe('districtMap');
  });
});
