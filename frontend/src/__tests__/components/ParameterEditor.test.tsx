// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {describe, test} from 'vitest';
import {Store} from '../../store';
import {screen, render} from '@testing-library/react';
import {I18nextProvider} from 'react-i18next';
import i18n from '../../util/i18nForTests';
import {Provider} from 'react-redux';
import React from 'react';
import ParameterEditor from '../../components/ParameterEditor';

describe('ParameterEditor', () => {
  test('Editor Loaded', async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <Provider store={Store}>
          <ParameterEditor />
        </Provider>
      </I18nextProvider>
    );

    screen.getByText('Parameter');
    await screen.findByText('parameters.no-parameters');
  });
});
