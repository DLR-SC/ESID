import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';
import Button from '@mui/material/Button/Button';
import React from 'react';

interface FilterButtonProps {
  folded: boolean;
  setFolded: (value: boolean) => void;
  borderColor: string;
  backgroundColor?: string;
  idNumber: number;
  maxCompartmentsRows: number;
}

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
