// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {useTranslation} from 'react-i18next';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import React from 'react';

export function MUILocalization(props: {children: string | JSX.Element | JSX.Element[]}): JSX.Element {
  const {i18n} = useTranslation();

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={i18n.language}>
      {props.children}
    </LocalizationProvider>
  );
}
