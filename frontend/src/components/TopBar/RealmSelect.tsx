// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR) and CISPA Helmholtz Center for Information Security
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import {useAppDispatch, useAppSelector} from 'store/hooks';
import {setRealm} from 'store/RealmSlice';
import {useTranslation} from 'react-i18next';
import Box from '@mui/material/Box';

function RealmSelect() {
  const {t} = useTranslation();

  const realm = useAppSelector((state) => state.realm.name);
  const dispatch = useAppDispatch();

  // realms are hardcoded for now
  // TODO: should be fetched from keycloak
  const realms = [
    {id: 'lha-a', name: 'LHA A', disabled: false},
    {id: 'lha-b', name: 'LHA B', disabled: true},
    {id: 'lha-c', name: 'LHA C', disabled: true},
  ];

  return (
    <Box sx={{my: 2}}>
      <FormControl size='small' sx={{minWidth: 120}}>
        <InputLabel id='login-dialog-realm-select-label'>{t('topBar.org')}</InputLabel>
        <Select
          labelId='login-dialog-realm-select-label'
          id='login-dialog-realm-select'
          value={realm}
          onChange={(event) => dispatch(setRealm(event.target.value))}
          label={t('topBar.org')}
        >
          {realms.map((realm) => (
            <MenuItem key={realm.id} value={realm.id} disabled={realm.disabled}>
              {realm.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}

export default RealmSelect;
