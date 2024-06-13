// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0
import Typography from '@mui/material/Typography';
import React from 'react';

interface CardTitleProps {
  /* Label for the card title */
  label: string;

  /* Boolean to determine if the card is flipped */
  isFlipped?: boolean;

  /* Color of the card title */
  color?: string;
}

/**
 * This component renders the title of a card with optional flipping and color customization.
 */
export default function CardTitle({label, isFlipped = true, color}: CardTitleProps) {
  return (
    <Typography
      variant='h2'
      sx={{
        fontWeight: 'bold',
        color: color,
        fontSize: '13pt',
        fontFamily: ['Inter', 'Arial', 'sans-serif'].join(','),
        paddingLeft: 3,
        marginTop: 4,
        transform: isFlipped ? 'none' : 'rotateY(-180deg)',
        textAlign: 'left',
      }}
    >
      {label}
    </Typography>
  );
}
