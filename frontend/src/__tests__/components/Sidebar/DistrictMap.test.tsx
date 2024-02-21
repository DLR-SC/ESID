// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import {describe, test, vi} from 'vitest';
import {render, screen} from '@testing-library/react';

import i18n from '../../../util/i18nForTests';

import {I18nextProvider} from 'react-i18next';
import {Provider} from 'react-redux';
import {Store} from '../../../store';
import DistrictMap from '../../../components/Sidebar/DistrictMap';
import Theme from '../../../util/Theme';
import {ThemeProvider} from '@mui/material/styles';

describe('District Map', () => {
  vi.stubGlobal('fetch', async () => Promise.all([]));

  test('district map load', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <Provider store={Store}>
          <ThemeProvider theme={Theme}>
            <DistrictMap />
          </ThemeProvider>
        </Provider>
      </I18nextProvider>
    );

    screen.getByLabelText('heatlegend.lock');
  });
});
