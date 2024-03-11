// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import {describe, test, expect, vi} from 'vitest';
import {act, render, screen} from '@testing-library/react';

import i18n from '../../../util/i18nForTests';

import {I18nextProvider} from 'react-i18next';
import LanguagePicker from '../../../components/TopBar/LanguagePicker';

describe('LanguagePicker', () => {
  vi.stubGlobal('fetch', vi.fn());

  test('init', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <LanguagePicker />
      </I18nextProvider>
    );

    screen.getByLabelText('topBar.language');
    screen.getByLabelText('Deutsch');
    screen.getByLabelText('English');
  });

  test('switch language', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <LanguagePicker />
      </I18nextProvider>
    );

    act(() => {
      screen.getByLabelText('Deutsch').click();
    });
    expect(i18n.language).toBe('de');

    act(() => {
      screen.getByLabelText('English').click();
    });
    expect(i18n.language).toBe('en');
  });
});
