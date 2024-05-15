import React from 'react';
import {FormControl, InputLabel, Select, OutlinedInput, MenuItem} from '@mui/material';
import {useAppDispatch, useAppSelector} from 'store/hooks';
import {setRealm} from 'store/RealmSlice';

function RealmSelect() {
  const realm = useAppSelector((state) => state.realm.name);
  const dispatch = useAppDispatch();

  // realms are hardcoded for now
  // should be fetched from keycloak
  const realms = ['lha-a', 'lha-b', 'lha-c'];

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
          <MenuItem key={realm} value={realm}>
            {realm}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default RealmSelect;
