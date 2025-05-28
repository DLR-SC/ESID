// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR) and CISPA Helmholtz Center for Information Security
// SPDX-License-Identifier: Apache-2.0

import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export interface Auth {
  token: string | null;
}

const initialState: Auth = {
  token: null,
};

export const AuthSlice = createSlice({
  name: 'Auth',
  initialState,
  reducers: {
    setToken(state, action: PayloadAction<string | null>) {
      state.token = action.payload;
    },
  },
});

export const {setToken} = AuthSlice.actions;
export default AuthSlice.reducer;
