// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {Tooltip, IconButton} from '@mui/material';
import {LockOpen, Lock} from '@mui/icons-material';
import {useTheme} from '@mui/material';
import React, {useMemo} from 'react';
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
  localization,
}: LockMaxValueProps): JSX.Element {
  const theme = useTheme();
  const {t: defaultT} = useTranslation();

  const memoizedLocalization = useMemo(() => {
    return (
      localization || {
        formatNumber: (value) => value.toLocaleString(),
        customLang: 'global',
        overrides: {},
      }
    );
  }, [localization]);

  const {t: customT} = useTranslation(memoizedLocalization.customLang);
  return (
    <Tooltip
      title={
        memoizedLocalization.overrides?.['heatlegend.lock']
          ? customT(memoizedLocalization.overrides['heatlegend.lock'])
          : defaultT('heatlegend.lock')
      }
      placement='right'
      arrow
    >
      <IconButton
        color={'primary'}
        aria-label={
          memoizedLocalization.overrides && memoizedLocalization.overrides['heatlegend.lock']
            ? customT(memoizedLocalization.overrides['heatlegend.lock'])
            : defaultT('heatlegend.lock')
        }
        onClick={() => setFixedLegendMaxValue(fixedLegendMaxValue ? null : aggregatedMax)}
        size='small'
        sx={{padding: theme.spacing(0)}}
      >
        {fixedLegendMaxValue ? <Lock /> : <LockOpen />}
      </IconButton>
    </Tooltip>
  );
}
