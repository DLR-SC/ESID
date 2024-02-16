// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import Box from '@mui/material/Box';
import {useTranslation} from 'react-i18next';
import React from 'react';
import logo from '../../../assets/logo/LOKI_compact.svg';

export default function SidebarTabs(): JSX.Element {
  const {t, i18n} = useTranslation('global');

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '422px',
        height: '100%',
      }}
    >
      {/* This is a placeholder for now. */}
      <a
        href={`https://www.helmholtz.de/loki-pandemics/${i18n.language.includes('de') ? '' : 'en/'}`}
        target='_blank'
        rel='noopener noreferrer'
        style={{width: '40%'}}
      >
        <img src={logo} alt={t('loki-logo')} width='100%' />
      </a>
    </Box>
  );
}
