// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export interface UserPreference {
  selectedSidebarTab?: string;
}

const initialState: UserPreference = {
  selectedSidebarTab: '1',
};

/**
 * This slice manages all state that has to do with user preferences.
 */
export const UserPreferenceSlice = createSlice({
  name: 'UserPreference',
  initialState,
  reducers: {
    selectSidebarTab(state, action: PayloadAction<string>) {
      state.selectedSidebarTab = action.payload;
    },
  },
});

export const {selectSidebarTab} = UserPreferenceSlice.actions;
export default UserPreferenceSlice.reducer;
