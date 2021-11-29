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
    render(
      <I18nextProvider i18n={i18n}>
        <Provider store={Store}>
          <SearchBar />
        </Provider>
      </I18nextProvider>
    );

    screen.getByPlaceholderText('germany');

    act(() => {
      Store.dispatch(selectDistrict({ags: '12345', name: 'Test District', type: 'Test Type'}));
    });

    screen.getByPlaceholderText('Test District');
  });
});
