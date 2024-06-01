// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR) and CISPA Helmholtz Center for Information Security
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import {ReactNode} from 'react';
import {AuthProvider as OAuth2WithPkceProvider, TAuthConfig} from 'react-oauth2-code-pkce';
import {useAppSelector} from 'store/hooks';

interface AuthProviderProps {
  children: ReactNode;
}

function AuthProvider({children}: AuthProviderProps) {
  const realm = useAppSelector((state) => state.realm.name);

  const authConfig: TAuthConfig = {
    clientId: `${import.meta.env.VITE_OAUTH_CLIENT_ID || ''}`,
    authorizationEndpoint: `${import.meta.env.VITE_OAUTH_API_URL || ''}/realms/${realm}/protocol/openid-connect/auth`,
    tokenEndpoint: `${import.meta.env.VITE_OAUTH_API_URL || ''}/realms/${realm}/protocol/openid-connect/token`,
    redirectUri: window.location.origin, // always redirect to root
    scope: 'openid profile email', // default scope without audience
    autoLogin: false,
  };

  return <OAuth2WithPkceProvider authConfig={authConfig}>{children}</OAuth2WithPkceProvider>;
}

export default AuthProvider;
