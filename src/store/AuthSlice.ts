// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR) and CISPA Helmholtz Center for Information Security
// SPDX-License-Identifier: Apache-2.0

import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export interface Auth {
  realm: string | null;
  token: string | null;
}

const initialState: Auth = {
  realm: '',
  token: null,
};

export const AuthSlice = createSlice({
  name: 'Realm',
  initialState,
  reducers: {
    setRealm(state, action: PayloadAction<string | null>) {
      state.realm = action.payload;
    },
    setToken(state, action: PayloadAction<string | null>) {
      state.token = action.payload;
    },
  },
});

export const {setRealm, setToken} = AuthSlice.actions;
export default AuthSlice.reducer;
