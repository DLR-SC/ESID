import React from 'react';
import {act, render, screen} from '@testing-library/react';

import i18n from '../../../util/i18nForTests';

import SearchBar from '../../../components/Sidebar/SearchBar';
import {I18nextProvider} from 'react-i18next';
import {Provider} from 'react-redux';
import Store from '../../../store';
import {selectDistrict} from '../../../store/DataSelectionSlice';

describe('SearchBar', () => {
  test('placeholder', () => {
    // We mock fetch to return two entries for searchable districts.
    global.fetch = jest.fn().mockImplementation(() => {
      return Promise.resolve({
        json: () => {
          return Promise.resolve([
            {
              RS: '12345',
              GEN: 'Test District',
              BEZ: 'Test Type',
            },
            {
              RS: '09771',
              GEN: 'Aichach-Friedberg',
              BEZ: 'LK',
            },
          ]);
        },
      });
    });

    act(() => {
      render(
        <I18nextProvider i18n={i18n}>
          <Provider store={Store}>
            <SearchBar />
          </Provider>
        </I18nextProvider>
      );
    });

    screen.getByPlaceholderText('search');

    act(() => {
      Store.dispatch(selectDistrict({ags: '12345', name: 'Test District', type: 'Test Type'}));
    });

    screen.getByDisplayValue('Test District (BEZ.Test Type)');
  });
});
