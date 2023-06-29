import React from 'react';
import {render, screen} from '@testing-library/react';

import i18n from '../../../util/i18nForTests';

import {I18nextProvider} from 'react-i18next';
import LanguagePicker from '../../../components/TopBar/LanguagePicker';

describe('LanguagePicker', () => {
  test('init', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <LanguagePicker />
      </I18nextProvider>
    );

    screen.getByLabelText('topBar.language');
    screen.getByLabelText('Deutsch');
    screen.getByLabelText('English');
  });

  test('switch language', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <LanguagePicker />
      </I18nextProvider>
    );

    screen.getByLabelText('Deutsch').click();
    expect(i18n.language).toStrictEqual('de');

    screen.getByLabelText('English').click();
    expect(i18n.language).toStrictEqual('en');
  });
});
