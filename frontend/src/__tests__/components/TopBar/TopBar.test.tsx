// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import {describe, test} from 'vitest';
import {render, screen} from '@testing-library/react';

import i18n from '../../../util/i18nForTests';

import TopBar from '../../../components/TopBar';
import {I18nextProvider} from 'react-i18next';
import {Store} from '../../../store';
import {Provider} from 'react-redux';

describe('TopBar', () => {
  test('icon', () => {
    render(
      <Provider store={Store}>
        <I18nextProvider i18n={i18n}>
          <TopBar />
        </I18nextProvider>
      </Provider>
    );
    screen.getByAltText('topBar.icon-alt');
    screen.getByLabelText('topBar.language');
    screen.getByLabelText('topBar.menu.label');
  });
});
