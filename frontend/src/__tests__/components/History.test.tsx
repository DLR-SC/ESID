import React from 'react';
import {render, screen} from '@testing-library/react';
import i18n from '../../util/i18nForTests';
import History from '../../components/History';
import {I18nextProvider} from 'react-i18next';

describe('History', () => {
  test('History', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <History />
      </I18nextProvider>
    );
    screen.getByText('history.placeholder');
  });
});
