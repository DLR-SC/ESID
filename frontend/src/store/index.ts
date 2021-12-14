import {configureStore} from '@reduxjs/toolkit';
import DataSelectionReducer from './DataSelectionSlice';
import {rkiApi} from './services/rkiApi';
import ScenarioReducer from './ScenarioSlice';

const Store = configureStore({
  reducer: {
    dataSelection: DataSelectionReducer,
    scenarioList: ScenarioReducer,
    [rkiApi.reducerPath]: rkiApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(rkiApi.middleware),
});

export default Store;

export type RootState = ReturnType<typeof Store.getState>;
export type AppDispatch = typeof Store.dispatch;
