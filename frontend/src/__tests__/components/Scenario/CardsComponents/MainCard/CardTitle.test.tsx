// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import {render, screen} from '@testing-library/react';
import {describe, test, expect} from 'vitest';
import CardTitle from 'components/ScenarioComponents/CardsComponents/MainCard/CardTitle';

describe('CardTitle Component', () => {
  test('renders the card title with the correct label', () => {
    render(<CardTitle label='Test Label' />);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  test('applies the correct styles when isFlipped is false', () => {
    render(<CardTitle label='Test Label' isFlipped={false} />);
    const titleElement = screen.getByText('Test Label');
    expect(titleElement).toHaveStyle({
      transform: 'rotateY(-180deg)',
    });
  });

  test('applies the correct color when the color prop is provided', () => {
    render(<CardTitle label='Test Label' color='#00000' />);
    const titleElement = screen.getByText('Test Label');
    expect(titleElement).toHaveStyle({
      color: '#00000',
    });
  });
});
