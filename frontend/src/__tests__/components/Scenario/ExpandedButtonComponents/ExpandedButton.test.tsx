// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react';
import {describe, test, expect} from 'vitest';
import GeneralButton from 'components/ScenarioComponents/ExpandedButtonComponents/ExpandedButton';
import {ThemeProvider} from '@emotion/react';

import Theme from 'util/Theme';

const GeneralButtonTest = () => {
  const buttonTexts = {clicked: 'Clicked', unclicked: 'Unclicked'};
  const isDisabled = () => true;
  const handleClick = () => {};

  return (
    <div data-testid='general-button'>
      <ThemeProvider theme={Theme}>
        <GeneralButton buttonTexts={buttonTexts} isDisabled={isDisabled} handleClick={handleClick} isExpanded={false} />
      </ThemeProvider>
    </div>
  );
};

describe('GeneralButtonTest', () => {
  test('renders the button with the correct initial text', async () => {
    render(<GeneralButtonTest />);
    const button = await screen.findByRole('button');
    expect(button).toHaveTextContent('Unclicked');
  });

  test('button is not disabled initially', async () => {
    render(<GeneralButtonTest />);
    const button = await screen.findByRole('button');
    expect(button).toBeDisabled();
  });

  test('button does change state when clicked', async () => {
    render(<GeneralButtonTest />);
    const button = await screen.findByRole('button');
    fireEvent.click(button);
    expect(button).toHaveTextContent('clicked');
  });
});
