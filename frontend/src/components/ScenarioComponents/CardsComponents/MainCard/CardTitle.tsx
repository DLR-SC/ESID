// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0
import Typography from '@mui/material/Typography';
import React from 'react';

interface CardTitleProps {
  /* Label for the card title */
  label: string;

  /* Color of the card title */
  color?: string;
}

/**
 * This component renders the title of a card with optional flipping and color customization.
 */
export default function CardTitle({label, color}: CardTitleProps) {
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
        textAlign: 'left',
      }}
    >
      {label}
    </Typography>
  );
}
