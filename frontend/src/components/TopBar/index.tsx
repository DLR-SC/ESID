// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {useTheme} from '@mui/material/styles';
import React from 'react';
import {useTranslation} from 'react-i18next';
import ApplicationMenu from './ApplicationMenu';
import Box from '@mui/material/Box';
import LanguagePicker from './LanguagePicker';
import esidLogo from '../../../assets/logo/logo-200x66.svg';

/**
 * This is the top navigation bar of the application. It contains the logo and a burger menu to access settings and
 * information.
 */
export default function TopBar(): JSX.Element {
  const {t} = useTranslation();
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        height: '56px',
        backgroundColor: theme.palette.background.default,
        borderBottom: `1px solid ${theme.palette.divider}`,
        paddingLeft: theme.spacing(4),
        paddingRight: theme.spacing(4),
        gap: theme.spacing(4),
      }}
    >
      <Box sx={{display: 'flex', alignItems: 'center'}}>
        <img
          id='application-icon'
          style={{
            height: '36px',
            width: 'auto',
          }}
          src={esidLogo}
          alt={t('topBar.icon-alt')}
        />
      </Box>
      <Box sx={{flexGrow: 1}} />
      <LanguagePicker />
      <ApplicationMenu />
    </Box>
  );
}
