// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import {describe, test, expect, vi} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import {ThemeProvider} from '@mui/material/styles';
import Theme from 'util/Theme';
import TourChip from '../../../../components/OnboardingComponents/TourComponents/TourChip';
import {TourType} from '../../../../types/tours';

const TourChipTest = (props: {
  icon: React.ReactElement;
  tourType: TourType;
  label: string;
  isCompleted: boolean;
  onClick: (tour: TourType) => void;
}) => (
  <ThemeProvider theme={Theme}>
    <TourChip {...props} />
  </ThemeProvider>
);

describe('TourChip Component', () => {
  test('renders the chip with label and icon', () => {
    render(
      <TourChipTest
        icon={<span>Icon</span>}
        tourType='filter'
        label='Tour Label'
        isCompleted={false}
        onClick={() => {}}
      />
    );
    expect(screen.getByText('Tour Label')).toBeInTheDocument();
    expect(screen.getByText('Icon')).toBeInTheDocument();
  });

  test('applies correct color when isCompleted is true', () => {
    render(
      <TourChipTest
        icon={<span>Icon</span>}
        tourType='filter'
        label='Tour Label'
        isCompleted={true}
        onClick={() => {}}
      />
    );

    const chip = screen.getByText('Tour Label').closest('div');
    expect(chip).toHaveStyle(`color: ${Theme.palette.text.disabled}`);
    expect(chip).toHaveStyle(`border-color: ${Theme.palette.text.disabled}`);
  });

  test('applies correct color when isCompleted is false', () => {
    render(
      <TourChipTest
        icon={<span>Icon</span>}
        tourType='filter'
        label='Tour Label'
        isCompleted={false}
        onClick={() => {}}
      />
    );

    const chip = screen.getByText('Tour Label').closest('div');
    expect(chip).toHaveStyle(`color: ${Theme.palette.primary.main}`);
    expect(chip).toHaveStyle(`border-color: ${Theme.palette.primary.main}`);
  });

  test('calls onClick with correct tourType when clicked', () => {
    const handleClick = vi.fn();
    render(
      <TourChipTest
        icon={<span>Icon</span>}
        tourType='scenario'
        label='Tour Label'
        isCompleted={false}
        onClick={handleClick}
      />
    );

    fireEvent.click(screen.getByText('Tour Label'));
    expect(handleClick).toHaveBeenCalledWith('scenario');
  });
});
