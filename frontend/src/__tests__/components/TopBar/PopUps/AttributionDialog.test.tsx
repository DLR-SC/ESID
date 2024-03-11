// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {Suspense} from 'react';
import {describe, test, vi, expect} from 'vitest';
import {act, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import i18n from '../../../../util/i18nForTests';

import {I18nextProvider} from 'react-i18next';
import {forceVisible} from 'react-lazyload';
import ApplicationMenu from '../../../../components/TopBar/ApplicationMenu';

describe('AttributionDialog', () => {
  test('PopUp', async () => {
    // We mock fetch to return two entries for attributions.
    const fetch = vi.fn().mockImplementation(() => {
      return Promise.resolve({
        json: () => {
          return Promise.resolve([
            {
              name: 'SomeLib',
              version: '1.0.1',
              authors: 'John Doe, Jane, Doe',
              repository: 'github.com',
              license: 'MIT',
              licenseText: 'MIT License Text ...',
            },
            {
              name: 'OtherLib',
              version: null,
              authors: null,
              repository: null,
              license: null,
              licenseText: null,
            },
          ]);
        },
      });
    });

    vi.stubGlobal('fetch', fetch);

    render(
      <I18nextProvider i18n={i18n}>
        <Suspense>
          <ApplicationMenu />
        </Suspense>
      </I18nextProvider>
    );

    const menu = screen.getByLabelText('topBar.menu.label');
    await userEvent.click(menu);

    const attribution = screen.getByText('topBar.menu.attribution');
    await userEvent.click(attribution);

    await screen.findByText('attribution.header');
    await screen.findByText('attribution.thank-you-text');

    // Make sure that fetch was called with the correct value.
    expect(fetch).toHaveBeenCalledWith('/assets/third-party-attributions.json');

    // Forces the lazy loaded components to load. This is needed, since there is no viewport, that would trigger a load.
    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => forceVisible());

    await screen.findByText('SomeLib');
    await screen.findByText('1.0.1');

    await screen.findByText('attribution.authors:');
    await screen.findByText('John Doe, Jane, Doe');

    await screen.findByText('attribution.repository:');
    await screen.findByText('github.com');

    await screen.findByText('MIT License Text ...');

    await screen.findByText('OtherLib');

    fetch.mockClear();
  });
});
