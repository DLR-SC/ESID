// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import Chip from '@mui/material/Chip';
import {useTheme} from '@mui/material/styles';
import {TourType} from '../../../types/tours';

interface TourChipProps {
  /** icon that is displayed on the left side of the chip */
  icon: React.ReactElement;

  /** type of the tour that the chip represents */
  tourType: TourType;

  /** label of the chip */
  label: string;

  /** whether the tour is completed or not */
  isCompleted: boolean;

  /** function that is called when the chip is clicked */
  onClick: (tour: TourType) => void;
}

/**
 * This component is a chip that represents a tour that the user can take
 */
export default function TourChip(props: TourChipProps): JSX.Element {
  const theme = useTheme();
  const chipColor = props.isCompleted ? theme.palette.text.disabled : theme.palette.primary.main;

  return (
    <Chip
      icon={props.icon}
      label={props.label}
      variant='outlined'
      onClick={() => props.onClick(props.tourType)}
      sx={{
        fontSize: theme.typography.listElement.fontSize,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        justifyContent: 'left',
        padding: '0 8px',
        borderColor: chipColor,
        color: chipColor,
        '& .MuiChip-label': {
          padding: '0 8px',
          color: chipColor,
        },
        '& .MuiChip-icon': {
          color: chipColor,
        },
      }}
    />
  );
}
