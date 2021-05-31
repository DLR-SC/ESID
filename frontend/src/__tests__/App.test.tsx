import React from 'react';
import {render} from '@testing-library/react';
import {I18nextProvider} from 'react-i18next';

import '../util/i18nForTests';
import App from '../App';
import i18n from '../util/i18nForTests';

describe('App', () => {
  test('App', () => {
    render(<I18nextProvider i18n={i18n}><App /></I18nextProvider>);
    const app = document.getElementById('app');
    expect(app).not.toBeNull();
  });
});
