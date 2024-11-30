import {MenuItem} from '@mui/material';
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
