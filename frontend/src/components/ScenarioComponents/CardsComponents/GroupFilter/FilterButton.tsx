// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';
import Button from '@mui/material/Button/Button';

interface FilterButtonProps {
  /* Boolean to determine if the filter button is folded */
  folded: boolean;

  /* Function to set the folded state */
  setFolded: (value: boolean) => void;

  /* Color of the button border */
  borderColor: string;

  /* Background color of the button */
  backgroundColor: string;

  /* ID number of the button */
  idNumber: number;

  /* Maximum number of compartment rows */
  maxCompartmentsRows: number;

  /* Minimum number of compartment rows */
  minCompartmentsRows: number;

  /* Boolean to determine if the compartments are expanded */
  compartmentsExpanded: boolean;
}

/**
 * This component renders the filter button which open or close the container of filter cards.
 * The button displays a left or right chevron icon depending on the folded state.
 */
export default function FilterButton({
  folded,
  setFolded,
  borderColor,
  idNumber,
  backgroundColor,
  maxCompartmentsRows,
  compartmentsExpanded,
  minCompartmentsRows,
}: FilterButtonProps) {
  return (
    <Button
      id={`scenario-card-number-group-filter-fold-toggle-${idNumber}`}
      sx={{
        width: '26px',
        minWidth: '26px',
        maxHeight: compartmentsExpanded
          ? maxCompartmentsRows > 5
            ? `${(390 / 6) * maxCompartmentsRows}px`
            : `${(480 / 6) * maxCompartmentsRows}px`
          : minCompartmentsRows < 4
            ? `${(365 / 4) * minCompartmentsRows}px`
            : `${(325 / 4) * minCompartmentsRows}px`,
        boxSizing: 'border-box',
        borderRight: `1px solid ${borderColor}`,
        marginRight: '1px',
        bgcolor: backgroundColor,
      }}
      onClick={() => setFolded(!folded)}
    >
      {folded ? <ChevronLeft /> : <ChevronRight />}
    </Button>
  );
}
