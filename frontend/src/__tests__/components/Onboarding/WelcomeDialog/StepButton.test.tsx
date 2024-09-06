// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import {describe, test, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import {ThemeProvider} from '@mui/system';
import Theme from 'util/Theme';
import {Provider} from 'react-redux';
import {Store} from '../../../../store';
import StepButton from 'components/OnboardingComponents/WelcomeDialog/StepButton';

const handleClick = vi.fn();

const StepButtonTest = () => (
  <ThemeProvider theme={Theme}>
    <Provider store={Store}>
      <StepButton direction={'next'} onClick={handleClick} disabled={false} />
    </Provider>
  </ThemeProvider>
);

describe('Step Button Component', () => {
  test('renders the button', () => {
    render(<StepButtonTest />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
