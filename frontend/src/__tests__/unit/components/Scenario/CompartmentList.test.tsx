// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import {describe, test, vi, afterEach, beforeEach} from 'vitest';
import {cleanup, render, screen} from '@testing-library/react';

import i18n from '../../../../util/i18nForTests';

import {I18nextProvider} from 'react-i18next';
import {Provider} from 'react-redux';
import {Store} from '../../../../store';
import {setStartDate} from '../../../../store/DataSelectionSlice';
import CompartmentList from '../../../../components/Scenario/CompartmentList';
import {MUILocalization} from '../../../../components/shared/MUILocalization';

describe('CompartmentList', () => {
  vi.stubGlobal('fetch', async () => Promise.all([]));

  // Mock the ResizeObserver
  const ResizeObserverMock = vi.fn(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  vi.stubGlobal('ResizeObserver', ResizeObserverMock);

  beforeEach(() => {
    Store.dispatch(setStartDate('2020-02-20'));
  });

  test('Date Loaded Correctly', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <MUILocalization>
          <Provider store={Store}>
            <CompartmentList />
          </Provider>
        </MUILocalization>
      </I18nextProvider>
    );

    screen.getAllByText('scenario.reference-day');
    screen.getByPlaceholderText('MM/DD/YYYY');
    screen.getByDisplayValue('02/20/2020');
  });

  afterEach(() => {
    cleanup();
  });
});
