import Typography from '@mui/material/Typography';
import React from 'react';

interface CardTitleProps {
  label: string;
  isFlipped?: boolean;
  color?: string;
}

export default function CardTitle({label, isFlipped = true, color}: CardTitleProps) {
  return (
    <Typography
      variant='h2'
      sx={{
        fontWeight: 'bold',
        color: color,
        fontSize: '13pt',
        fontFamily: ['Inter', 'Arial', 'sans-serif'].join(','),
        marginLeft: isFlipped ? 2 : 4,
        marginTop: 4,
        transform: isFlipped ? 'none' : 'rotateY(-180deg)',
        textAlign: isFlipped ? 'left' : 'right',
      }}
    >
      {label}
    </Typography>
  );
}
