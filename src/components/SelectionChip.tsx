// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import Chip from '@mui/material/Chip';
import {AggregationWindow} from 'store/DataSelectionSlice';

export interface SelectionChipProps {
  relativeNumbers: boolean;
  aggregationWindow: AggregationWindow;
  selectedCompartment: string;
  onClick: (event: React.MouseEvent<HTMLElement>) => void;
}

export default function SelectionChip({
  relativeNumbers,
  aggregationWindow,
  selectedCompartment,
  onClick,
}: SelectionChipProps): JSX.Element {
  const {t} = useTranslation();
  const aggregationWindowLabel = useMemo(() => {
    switch (aggregationWindow) {
      case AggregationWindow.Total:
        return t('icon-bar.display-settings.total');
      case AggregationWindow.OneDay:
        return t('icon-bar.display-settings.one-day');
      case AggregationWindow.SevenDays:
        return t('icon-bar.display-settings.seven-days');
    }
  }, [aggregationWindow, t]);

  const numberTypeLabel = useMemo(() => {
    return relativeNumbers ? t('icon-bar.selection-chip.per-100k') : '';
  }, [relativeNumbers, t]);

  return (
    <Chip
      color='primary'
      label={`${aggregationWindowLabel} ${selectedCompartment} ${numberTypeLabel}`}
      variant='filled'
      onClick={onClick}
    />
  );
}
