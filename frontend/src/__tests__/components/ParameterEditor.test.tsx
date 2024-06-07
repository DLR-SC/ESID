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
import {selectScenario} from '../../store/DataSelectionSlice';

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

    await screen.findByText('group-filters.groups.age_0');
    await screen.findByText('group-filters.groups.age_1');
    await screen.findByText('group-filters.groups.age_2');
    await screen.findByText('group-filters.groups.age_3');
    await screen.findByText('group-filters.groups.age_4');
    await screen.findByText('group-filters.groups.age_5');

    await screen.findByText('parameters.no-parameters');

    Store.dispatch(selectScenario(1));

    await screen.findByText('parameters.Test Parameter 1.symbol');
    await screen.findByText('parameters.Test Parameter 1.description');
    await screen.findByText(/0 - 1 parameters\.Test Parameter 1\.unit/);

    await screen.findByText('parameters.Test Parameter 2.symbol');
    await screen.findByText('parameters.Test Parameter 2.description');
  });
});
