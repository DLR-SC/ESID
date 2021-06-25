import React from 'react';
import {render, screen} from '@testing-library/react';

import i18n from '../../../../util/i18nForTests';

import {I18nextProvider} from 'react-i18next';
import ApplicationMenu from '../../../../components/TopBar/ApplicationMenu';

describe('AccessibilityDialog', () => {
  test('PopUp', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <ApplicationMenu />
      </I18nextProvider>
    );
    screen.getByLabelText('topBar.menu.label').click();
    screen.getByText('topBar.menu.accessibility').click();
    screen.getByText('accessibility.header');
    screen.getByText('accessibility.content');
  });
});
