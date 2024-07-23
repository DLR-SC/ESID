// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {useState} from 'react';
import {describe, test, expect} from 'vitest';
import {render, screen, waitFor} from '@testing-library/react';
import {I18nextProvider} from 'react-i18next';
import ReferenceDatePicker from 'components/ScenarioComponents/ReferenceDatePickerComponents.tsx/ReferenceDatePicker';
import {MUILocalization} from '../../../components/shared/MUILocalization';
import {ThemeProvider} from '@mui/system';
import Theme from 'util/Theme';
import i18n from 'util/i18n';
import userEvent from '@testing-library/user-event';

const ReferenceDatePickerTest = () => {
  const [startDate, setStartDate] = useState<string | null>('2020-02-20');
  const minDate = '2019-02-20';
  const maxDate = '2021-02-20';

  return (
    <div data-testid='date-picker'>
      <ReferenceDatePicker startDay={startDate} setStartDay={setStartDate} minDate={minDate} maxDate={maxDate} />
    </div>
  );
};

describe('ReferenceDatePicker', () => {
  test('renders ReferenceDatePicker component', async () => {
    render(
      <ThemeProvider theme={Theme}>
        <I18nextProvider i18n={i18n}>
          <MUILocalization>
            <ReferenceDatePickerTest />
          </MUILocalization>
        </I18nextProvider>
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByLabelText('scenario.reference-day')).toBeInTheDocument();
    });
  });

  test('displays the correct initial date', () => {
    render(
      <ThemeProvider theme={Theme}>
        <I18nextProvider i18n={i18n}>
          <MUILocalization>
            <ReferenceDatePickerTest />
          </MUILocalization>
        </I18nextProvider>
      </ThemeProvider>
    );

    expect(screen.getByDisplayValue('02/20/2020')).toBeInTheDocument();
  });

  test('updates the date when a new date is selected', async () => {
    render(
      <ThemeProvider theme={Theme}>
        <I18nextProvider i18n={i18n}>
          <MUILocalization>
            <ReferenceDatePickerTest />
          </MUILocalization>
        </I18nextProvider>
      </ThemeProvider>
    );

    const el = screen.getByPlaceholderText('MM/DD/YYYY');
    await userEvent.type(el, '03/23/2020{enter}');
    expect(screen.getByDisplayValue('03/23/2020')).toBeInTheDocument();
  });
});
