// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';
import Button from '@mui/material/Button/Button';
import React from 'react';

interface FilterButtonProps {
  /* Boolean to determine if the filter button is folded */
  folded: boolean;

  /* Function to set the folded state */
  setFolded: (value: boolean) => void;

  /* Color of the button border */
  borderColor: string;

  /* Background color of the button */
  backgroundColor?: string;

  /* ID number of the button */
  idNumber: number;

  /* Maximum number of compartment rows */
  maxCompartmentsRows: number;
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
  maxCompartmentsRows,
}: FilterButtonProps) {
  return (
    <Button
      id={`scenario-card-number-group-filter-fold-toggle-${idNumber}`}
      sx={{
        width: '26px',
        minWidth: '26px',
        maxHeight: `${(332 / 6) * maxCompartmentsRows}px`,
        boxSizing: 'border-box',
        borderRight: `1px solid ${borderColor}`,
        marginRight: '1px',
        bgcolor: 'white',
      }}
      onClick={() => setFolded(!folded)}
    >
      {folded ? <ChevronLeft /> : <ChevronRight />}
    </Button>
  );
}
