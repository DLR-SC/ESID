// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import {describe, test, vi, afterEach, beforeEach, expect} from 'vitest';
import {act, cleanup, render, screen} from '@testing-library/react';

import i18n from '../../../util/i18nForTests';

import {I18nextProvider} from 'react-i18next';
import {Provider} from 'react-redux';
import {Store} from '../../../store';
import {setStartDate} from '../../../store/DataSelectionSlice';
import CompartmentList from '../../../components/Scenario/CompartmentList';
import {MUILocalization} from '../../../components/shared/MUILocalization';
import userEvent from '@testing-library/user-event';

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

  test('Set Reference Date', async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <MUILocalization>
          <Provider store={Store}>
            <CompartmentList />
          </Provider>
        </MUILocalization>
      </I18nextProvider>
    );

    const el = screen.getByPlaceholderText('MM/DD/YYYY');
    await userEvent.click(el);
    await userEvent.keyboard('03/23/2023[Enter]');

    screen.getByDisplayValue('03/23/2023');
    expect(Store.getState().dataSelection.simulationStart).toBe('2023-03-23');
  });

  test('Update Reference Date', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <MUILocalization>
          <Provider store={Store}>
            <CompartmentList />
          </Provider>
        </MUILocalization>
      </I18nextProvider>
    );

    screen.getByDisplayValue('02/20/2020');

    act(() => {
      Store.dispatch(setStartDate('2023-03-23'));
    });

    expect(Store.getState().dataSelection.simulationStart).toBe('2023-03-23');
    screen.getByDisplayValue('03/23/2023');
  });

  afterEach(() => {
    cleanup();
  });
});
