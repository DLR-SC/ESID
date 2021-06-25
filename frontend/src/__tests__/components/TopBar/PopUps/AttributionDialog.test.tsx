import React from 'react';
import {act, render, screen} from '@testing-library/react';

import i18n from '../../../../util/i18nForTests';

import {I18nextProvider} from 'react-i18next';
import ApplicationMenu from '../../../../components/TopBar/ApplicationMenu';

describe('AttributionDialog', () => {
  test('PopUp', async () => {

    // We mock fetch to return two entries for attributions.
    global.fetch = jest.fn().mockImplementation(() => {
      return Promise.resolve({
        json: () => {
          return Promise.resolve([{
            name: 'SomeLib',
            version: '1.0.1',
            authors: 'John Doe, Jane, Doe',
            repository: 'github.com',
            license: 'MIT',
            licenseText: 'MIT License Text ...',
          }, {
            name: 'OtherLib',
            version: null,
            authors: null,
            repository: null,
            license: null,
            licenseText: null,
          }]);
        },
      });
    });

    render(
      <I18nextProvider i18n={i18n}>
        <ApplicationMenu />
      </I18nextProvider>,
    );

    screen.getByLabelText('topBar.menu.label').click();
    screen.getByText('topBar.menu.attribution').click();
    screen.getByText('attribution.header');
    screen.getByText('attribution.thank-you-text');

    // Make sure that fetch was called with the correct value.
    await act(async () => {
      expect(global.fetch).toBeCalledWith('assets/third-party-attributions.json');
    });

    // Ensure that all information is displayed.
    await act(async () => {
      screen.getByText('SomeLib');
      screen.getByText('1.0.1');

      screen.getByText('attribution.authors:');
      screen.getByText('John Doe, Jane, Doe');

      screen.getByText('attribution.repository:');
      screen.getByText('github.com');

      screen.getByText('MIT License Text ...');

      screen.getByText('OtherLib');
    });

    // @ts-ignore Cleanup the mocked method.
    global.fetch.mockClear();
    // @ts-ignore Cleanup the mocked method.
    delete global.fetch;
  });
});
