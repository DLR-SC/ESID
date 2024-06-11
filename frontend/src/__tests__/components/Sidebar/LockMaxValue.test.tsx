// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import Theme from 'util/Theme';
import {ThemeProvider} from '@mui/system';
import LockMaxValue from 'components/Sidebar/MapComponents/LockMaxValue';
import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';
import {describe, test, vi, expect} from 'vitest';

describe('LockMaxValue', () => {
  test('renders LockMaxValue component', () => {
    render(
      <ThemeProvider theme={Theme}>
        <LockMaxValue setFixedLegendMaxValue={() => {}} fixedLegendMaxValue={null} aggregatedMax={0} />
      </ThemeProvider>
    );

    screen.getByLabelText('heatlegend.lock');
  });

  test('calls setFixedLegendMaxValue when lock is clicked', () => {
    const setFixedLegendMaxValueMock = vi.fn();
    render(
      <ThemeProvider theme={Theme}>
        <LockMaxValue
          setFixedLegendMaxValue={setFixedLegendMaxValueMock}
          fixedLegendMaxValue={null}
          aggregatedMax={10}
        />
      </ThemeProvider>
    );

    const lock = screen.getByRole('button');

    const openLock = screen.getByTestId('LockOpenIcon');
    const closedLock = screen.queryByTestId('LockIcon');

    screen.debug();
    expect(openLock).toBeInTheDocument();
    expect(closedLock).not.toBeInTheDocument();

    fireEvent.click(lock);

    expect(setFixedLegendMaxValueMock).toHaveBeenCalledWith(10);
  });
});
