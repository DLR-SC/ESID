// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import {describe, test} from 'vitest';
import {render} from '@testing-library/react';

import i18n from '../../../util/i18nForTests';

import SidebarHistory from '../../../components/Sidebar/SidebarHistory';
import {I18nextProvider} from 'react-i18next';

describe('History', () => {
  // eslint-disable-next-line vitest/expect-expect
  test('History', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <SidebarHistory />
      </I18nextProvider>
    );
    // screen.getByText('history.Tabtitle');
  });
});
