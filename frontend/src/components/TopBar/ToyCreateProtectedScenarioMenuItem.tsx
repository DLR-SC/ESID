// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR) and CISPA Helmholtz Center for Information Security
// SPDX-License-Identifier: Apache-2.0

import MenuItem from '@mui/material/MenuItem';
import React from 'react';
import {useContext} from 'react';
import {AuthContext, IAuthContext} from 'react-oauth2-code-pkce';
import {useCreateProtectedScenarioMutation} from 'store/services/scenarioApi';

export default function ToyCreateProtectedScenarioMenuItem() {
  const {token} = useContext<IAuthContext>(AuthContext);

  const [createProtectedScenario] = useCreateProtectedScenarioMutation();

  const createProtectedScenarioClicked = () => {
    createProtectedScenario(token)
      .unwrap()
      .then((res) => alert(JSON.stringify(res)))
      .catch((err) => alert(JSON.stringify(err)));
  };

  return <MenuItem onClick={createProtectedScenarioClicked}>Create Protected Scenario</MenuItem>;
}
