// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR) and CISPA Helmholtz Center for Information Security
// SPDX-License-Identifier: Apache-2.0

import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export interface Realm {
  name: string;
}

const initialState: Realm = {
  name: '',
};

export const RealmSlice = createSlice({
  name: 'Realm',
  initialState,
  reducers: {
    setRealm(state, action: PayloadAction<string>) {
      state.name = action.payload;
    },
  },
});

export const {setRealm} = RealmSlice.actions;
export default RealmSlice.reducer;
