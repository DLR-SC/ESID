// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import {describe, expect, it, vi} from 'vitest';
import {render, fireEvent, screen} from '@testing-library/react';

import ConfirmDialog from '../../../components/shared/ConfirmDialog';

describe('ConfirmDialog', () => {
  it('renders the correct title and text', () => {
    const handleAnswer = vi.fn();

    const title = 'Confirm Action';
    const text = 'Are you sure you want to perform this action?';

    render(<ConfirmDialog open title={title} text={text} onAnswer={handleAnswer} />);

    screen.getByText(title);
    screen.getByText(text);
  });

  it('calls the onAnswer prop with the correct answer', () => {
    const handleAnswer = vi.fn();

    render(<ConfirmDialog open title='Confirm Action' text='Are you sure?' onAnswer={handleAnswer} />);

    const abortButton = screen.getByText('Abort');
    fireEvent.click(abortButton);
    expect(handleAnswer).toHaveBeenCalledWith(false);

    const confirmButton = screen.getByText('Confirm');
    fireEvent.click(confirmButton);
    expect(handleAnswer).toHaveBeenCalledWith(true);
  });

  it('renders the correct button text', () => {
    const handleAnswer = vi.fn();
    const abortButtonText = 'Cancel';
    const confirmButtonText = 'Yes, I am sure';

    render(
      <ConfirmDialog
        open
        title='Confirm Action'
        text='Are you sure?'
        onAnswer={handleAnswer}
        abortButtonText={abortButtonText}
        confirmButtonText={confirmButtonText}
      />
    );

    screen.getByText(abortButtonText);
    screen.getByText(confirmButtonText);
  });
});
