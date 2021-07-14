import {configureStore} from '@reduxjs/toolkit';
import DataSelectionReducer from './DataSelectionSlice';

const Store = configureStore({
  reducer: {
    dataSelection: DataSelectionReducer,
  },
});

export default Store;

export type RootState = ReturnType<typeof Store.getState>;
export type AppDispatch = typeof Store.dispatch;
