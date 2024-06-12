// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {Tooltip} from '@mui/material';
import {LockOpen} from '@mui/icons-material';
import {IconButton} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import {useTheme} from '@mui/material';
import React from 'react';
import {Localization} from 'types/localization';
import {useTranslation} from 'react-i18next';

interface LockMaxValueProps {
  /**
   * Function to set the new fixed maximum value of the heatmap legend.
   */
  setFixedLegendMaxValue: (value: number | null) => void;

  /**
   * The current fixed maximum value of the heatmap legend.
   */
  fixedLegendMaxValue: number | null;

  /**
   * The aggregated maximum value calculated from the data.
   */
  aggregatedMax: number;

  /**
   * Optional localization settings for the component.
   */
  localization?: Localization;
}

/**
 * React Component to render a Lock Icon to fix the maximum value of the Heatmap Legend.
 * @returns {JSX.Element} JSX Element to render the Lock Icon.
 */
export default function LockMaxValue({
  setFixedLegendMaxValue,
  fixedLegendMaxValue,
  aggregatedMax,
  localization = {formatNumber: (value: number) => value.toString(), customLang: 'global', overrides: {}},
}: LockMaxValueProps): JSX.Element {
  const theme = useTheme();
  const {t: defaultT} = useTranslation();
  const {t: customT} = useTranslation(localization.customLang);
  return (
    <Tooltip
      title={
        localization.overrides && localization.overrides['heatlegend.lock']
          ? customT(localization.overrides['heatlegend.lock'])
          : defaultT('heatlegend.lock')
      }
      placement='right'
      arrow
    >
      <IconButton
        color={'primary'}
        aria-label={
          localization.overrides && localization.overrides['heatlegend.lock']
            ? customT(localization.overrides['heatlegend.lock'])
            : defaultT('heatlegend.lock')
        }
        onClick={() => setFixedLegendMaxValue(fixedLegendMaxValue ? null : aggregatedMax)}
        size='small'
        sx={{padding: theme.spacing(0)}}
      >
        {fixedLegendMaxValue ? <LockIcon /> : <LockOpen />}
      </IconButton>
    </Tooltip>
  );
}
