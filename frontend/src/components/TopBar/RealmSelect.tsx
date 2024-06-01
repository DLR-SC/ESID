// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR) and CISPA Helmholtz Center for Information Security
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import {FormControl, InputLabel, Select, OutlinedInput, MenuItem} from '@mui/material';
import {useAppDispatch, useAppSelector} from 'store/hooks';
import {setRealm} from 'store/RealmSlice';

function RealmSelect() {
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
    <FormControl sx={{m: 2, minWidth: 120}} size='small'>
      <InputLabel id='login-dialog-realm-select-label'>Realm</InputLabel>
      <Select
        labelId='login-dialog-realm-select-label'
        id='login-dialog-realm-select'
        value={realm}
        onChange={(event) => dispatch(setRealm(event.target.value))}
        input={<OutlinedInput label='Realm' />}
      >
        {realms.map((realm) => (
          <MenuItem key={realm.id} value={realm.id} disabled={realm.disabled}>
            {realm.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default RealmSelect;
