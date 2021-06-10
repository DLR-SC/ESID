import React from 'react';
import {render, screen} from '@testing-library/react';

import i18n from '../../../util/i18nForTests';

import TopBar from '../../../components/TopBar/TopBar';
import {I18nextProvider} from 'react-i18next';

describe('TopBar', () => {
  test('icon', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <TopBar />
      </I18nextProvider>
    );
    screen.getByAltText('topBar.icon-alt');
    screen.getByLabelText('topBar.menu.label');
  });
});
