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
    screen.getByText('0 - 4');
    screen.getByText('5 - 14');
    screen.getByText('15 - 34');
    screen.getByText('35 - 59');
    screen.getByText('60 - 79');
    screen.getByText('80+');

    await screen.findByText('parameters.Test Parameter 1.symbol');
    await screen.findByText('parameters.Test Parameter 1.description');
    await screen.findByText('0 - 1');
    await screen.findAllByText('0,5 - 1');
    await screen.findByText('0,5 - 2');

    await screen.findByText('parameters.Test Parameter 2.symbol');
    await screen.findByText('parameters.Test Parameter 2.description');
    await screen.findByText('0,3 - 0,7');
  });
});
