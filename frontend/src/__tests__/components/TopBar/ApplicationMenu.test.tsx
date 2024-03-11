// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import {describe, test} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import i18n from '../../../util/i18nForTests';

import {I18nextProvider} from 'react-i18next';
import ApplicationMenu from '../../../components/TopBar/ApplicationMenu';

describe('TopBarMenu', () => {
  test('open', async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <ApplicationMenu />
      </I18nextProvider>
    );
    const menu = screen.getByLabelText('topBar.menu.label');
    await userEvent.click(menu);

    screen.getByText('topBar.menu.imprint');
    screen.getByText('topBar.menu.privacy-policy');
    screen.getByText('topBar.menu.accessibility');
    screen.getByText('topBar.menu.attribution');
  });
});
