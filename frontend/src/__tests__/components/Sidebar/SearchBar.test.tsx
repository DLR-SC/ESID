import React from 'react';
import {act, render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import i18n from '../../../util/i18nForTests';

import SearchBar from '../../../components/Sidebar/SearchBar';
import {I18nextProvider} from 'react-i18next';
import {Provider} from 'react-redux';
import Store from '../../../store';
import {selectDistrict} from '../../../store/DataSelectionSlice';

describe('SearchBar', () => {
  // We mock fetch to return two entries for searchable districts.
  global.fetch = jest.fn().mockImplementation(() => {
    return Promise.resolve({
      json: () => {
        return Promise.resolve([
          {
            RS: '09771',
            GEN: 'Aichach-Friedberg',
            BEZ: 'LK',
          },
          {
            RS: '12345',
            GEN: 'Test District',
            BEZ: 'Test Type',
          },
        ]);
      },
    });
  });

  test('countyList loaded correctly', async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <Provider store={Store}>
          <SearchBar />
        </Provider>
      </I18nextProvider>
    );

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());

    await screen.findByPlaceholderText('search');
    await screen.findByDisplayValue('germany');

    userEvent.click(screen.getByPlaceholderText('search'));

    await screen.findByText('A');
    await screen.findByText('Aichach-Friedberg (BEZ.LK)');
    await screen.findByText('T');
    await screen.findByText('Test District (BEZ.Test Type)');
  });

  test('district changed by store', async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <Provider store={Store}>
          <SearchBar />
        </Provider>
      </I18nextProvider>
    );

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());

    act(() => {
      Store.dispatch(selectDistrict({ags: '12345', name: 'Test District', type: 'Test Type'}));
    });

    await screen.findByDisplayValue('Test District (BEZ.Test Type)');
  });

  test('select district by dropdown selection partial name (autocomplete)', async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <Provider store={Store}>
          <SearchBar />
        </Provider>
      </I18nextProvider>
    );

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());

    userEvent.type(screen.getByPlaceholderText('search'), 'Aic{Enter}');

    await screen.findByDisplayValue('Aichach-Friedberg (BEZ.LK)');
  });

  test('select district by dropdown selection with keyboard (Arrow-Down)', async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <Provider store={Store}>
          <SearchBar />
        </Provider>
      </I18nextProvider>
    );

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());

    userEvent.type(screen.getByPlaceholderText('search'), '{ArrowDown}{Enter}');

    await screen.findByDisplayValue('Test District (BEZ.Test Type)');
  });
});
