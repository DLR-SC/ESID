// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import {render, screen} from '@testing-library/react';
import {describe, test, expect, vi} from 'vitest';
import {Provider} from 'react-redux';
import {Store} from '../../../store';
import {I18nextProvider} from 'react-i18next';
import i18n from '../../../util/i18nForTests';
import TourChips from '../../../components/OnboardingComponents/TourComponents/TourChips';
import {TourType} from 'types/tours';

describe('TourChips', () => {
  const renderComponent = (onTourClick: (tour: TourType) => void) => {
    render(
      <Provider store={Store}>
        <I18nextProvider i18n={i18n}>
          <TourChips onTourClick={onTourClick} />
        </I18nextProvider>
      </Provider>
    );
  };

  test('renders all tour chips', () => {
    const mockOnTourClick = vi.fn();
    renderComponent(mockOnTourClick);

    expect(screen.getByText('District map')).toBeInTheDocument();
    expect(screen.getByText('Scenario')).toBeInTheDocument();
    expect(screen.getByText('Line chart')).toBeInTheDocument();
    expect(screen.getByText('Filter')).toBeInTheDocument();
  });
});
