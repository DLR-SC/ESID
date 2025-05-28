// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR) and CISPA Helmholtz Center for Information Security
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import {useAppDispatch, useAppSelector} from 'store/hooks';
import {setAvailableRealms, setRealm} from 'store/RealmSlice';
import {useTranslation} from 'react-i18next';
import Box from '@mui/material/Box';
import {useLazyGetRealmsQuery} from 'store/services/idpApi';
import CircularProgress from '@mui/material/CircularProgress';

export function RealmSelect() {
  const {t} = useTranslation();
  const dispatch = useAppDispatch();

  // use triggerGetRealms to explicitly fetch realms
  const [triggerGetRealms] = useLazyGetRealmsQuery();

  // select menu items (i.e. organizations/realms) loading state
  const [realmListLoading, setRealmListLoading] = React.useState(false);

  // a list of available organizations/realms
  const realmList = useAppSelector((state) => state.realm.availableRealms);

  // user selected organization/realm
  const realm = useAppSelector((state) => state.realm.name);

  // this is called when the user opens the select menu
  const handleSelectOpen = () => {
    setRealmListLoading(true);
    triggerGetRealms()
      .unwrap()
      .then((realmReprs) => {
        const newRealmList = realmReprs
          .filter((r) => r.enabled)
          .map((r) => ({
            id: r.realm,
            name: r.displayName ?? r.realm,
          }));
        dispatch(setAvailableRealms(newRealmList));
      })
      .catch((err) => {
        console.error('Failed to fetch realms:', err);
      })
      .finally(() => {
        setRealmListLoading(false);
      });
  };

  return (
    <Box sx={{my: 2}}>
      <FormControl size='small' sx={{minWidth: 120}}>
        <InputLabel id='login-dialog-realm-select-label'>{t('topBar.org')}</InputLabel>
        <Select
          labelId='login-dialog-realm-select-label'
          id='login-dialog-realm-select'
          // MUI Select checks for if value matches with child menu item values
          // It throws a warning if the value is not presented
          // Since we have two placeholder values (loading and no org),
          // we need to safe set the value to empty in both cases.
          value={!realmListLoading && realmList.map((r) => r.id).includes(realm) ? realm : ''}
          onChange={(event) => dispatch(setRealm(event.target.value))}
          label={t('topBar.org')}
          onOpen={handleSelectOpen}
        >
          {realmListLoading && (
            // Show loading spinner when fetching realms
            // ph stands for placeholder
            <MenuItem value='ph-loading' disabled>
              <CircularProgress />
            </MenuItem>
          )}
          {!realmListLoading && realmList.length === 0 && (
            // Show Empty when no realms are available
            <MenuItem value='ph-no-org' disabled>
              <em>{t('topBar.noOrg')}</em>
            </MenuItem>
          )}
          {!realmListLoading &&
            realmList.length > 0 &&
            realmList.map((realm) => (
              <MenuItem key={realm.id} value={realm.id}>
                {realm.name}
              </MenuItem>
            ))}
        </Select>
      </FormControl>
    </Box>
  );
}

export default RealmSelect;
