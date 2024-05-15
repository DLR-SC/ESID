import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export interface Realm {
  name: string;
}

const initialState: Realm = {
  name: localStorage.getItem('realm') || '',
};

export const RealmSlice = createSlice({
  name: 'Realm',
  initialState,
  reducers: {
    setRealm(state, action: PayloadAction<string>) {
      // store realm in local storage
      // redirects start new the browser sessions i.e. store state will be reset
      localStorage.setItem('realm', action.payload);
      state.name = action.payload;
    },
  },
});

export const {setRealm} = RealmSlice.actions;
export default RealmSlice.reducer;
