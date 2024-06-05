// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {Tooltip} from '@mui/material';
import {LockOpen} from '@mui/icons-material';
import {IconButton} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import {useTheme} from '@mui/material';
import React from 'react';

interface LockMaxValueProps {
  setFixedLegendMaxValue: (value: number | null) => void;
  fixedLegendMaxValue: number | null;
  aggregatedMax: number;
  t: (key: string) => string;
}

export default function LockMaxValue({
  setFixedLegendMaxValue,
  fixedLegendMaxValue,
  aggregatedMax,
  t,
}: LockMaxValueProps) {
  const theme = useTheme();
  return (
    <Tooltip title={t('heatlegend.lock').toString()} placement='right' arrow>
      <IconButton
        color={'primary'}
        aria-label={t('heatlegend.lock')}
        onClick={() => setFixedLegendMaxValue(fixedLegendMaxValue ? null : aggregatedMax)}
        size='small'
        sx={{padding: theme.spacing(0)}}
      >
        {fixedLegendMaxValue ? <LockIcon /> : <LockOpen />}
      </IconButton>
    </Tooltip>
  );
}
