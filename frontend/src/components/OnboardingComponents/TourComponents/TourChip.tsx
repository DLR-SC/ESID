// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import Chip from '@mui/material/Chip';
import {useTheme} from '@mui/material/styles';
import {TourType} from '../../../types/tours';

interface TourChipProps {
  icon: React.ReactElement;
  tourType: TourType;
  label: string;
  color: 'default' | 'primary';
  onClick: (tour: TourType) => void;
}

/**
 * This component is a chip that represents a tour that the user can take
 */
const TourChip: React.FC<TourChipProps> = ({icon, tourType, label, color, onClick}) => {
  const theme = useTheme();
  return (
    <Chip
      icon={icon}
      label={label}
      variant='outlined'
      color={color}
      onClick={() => onClick(tourType)}
      sx={{
        fontSize: theme.typography.listElement.fontSize,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        justifyContent: 'left',
        padding: '0 8px',
        '& .MuiChip-label': {
          padding: '0 8px',
        },
      }}
    />
  );
};

export default TourChip;
