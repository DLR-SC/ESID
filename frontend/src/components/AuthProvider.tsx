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
  let authConfig: TAuthConfig;

  if (!import.meta.env.VITE_OAUTH_CLIENT_ID || !import.meta.env.VITE_OAUTH_API_URL) {
    // in case required auth env vars are not set
    console.warn(
      'Missing environment variables: VITE_OAUTH_CLIENT_ID or VITE_OAUTH_API_URL. Please set it to enable authentication.'
    );
    authConfig = {
      clientId: 'client-placeholder',
      authorizationEndpoint: 'auth-endpoint-placeholder',
      tokenEndpoint: 'token-endpoint-placeholder',
      redirectUri: 'redirect-uri-placeholder',
      autoLogin: false,
    };
  } else {
    // actual auth configurations
    authConfig = {
      clientId: `${import.meta.env.VITE_OAUTH_CLIENT_ID}`,
      authorizationEndpoint: `${import.meta.env.VITE_OAUTH_API_URL}/realms/${realm}/protocol/openid-connect/auth`,
      tokenEndpoint: `${import.meta.env.VITE_OAUTH_API_URL}/realms/${realm}/protocol/openid-connect/token`,
      redirectUri:
        import.meta.env.VITE_OAUTH_REDIRECT_URL === undefined
          ? window.location.origin
          : `${import.meta.env.VITE_OAUTH_REDIRECT_URL}`,
      scope: 'openid profile email', // default scope without audience
      autoLogin: false,
    };
  }

  return <OAuth2WithPkceProvider authConfig={authConfig}>{children}</OAuth2WithPkceProvider>;
}

export default AuthProvider;
