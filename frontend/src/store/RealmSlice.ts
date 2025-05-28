// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR) and CISPA Helmholtz Center for Information Security
// SPDX-License-Identifier: Apache-2.0

import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export interface Realm {
  name: string;
  avalableRealms: RealmSelectItem[];
}

export interface RealmSelectItem {
  id: string;
  name: string;
}

const initialState: Realm = {
  name: '',
  avalableRealms: [],
};

export const RealmSlice = createSlice({
  name: 'Realm',
  initialState,
  reducers: {
    setRealm(state, action: PayloadAction<string>) {
      state.name = action.payload;
    },
    setAvailableRealms(state, action: PayloadAction<RealmSelectItem[]>) {
      state.avalableRealms = action.payload;
    },
  },
});

export const {setRealm, setAvailableRealms} = RealmSlice.actions;
export default RealmSlice.reducer;
