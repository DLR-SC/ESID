import {configureStore} from '@reduxjs/toolkit';
import DataSelectionReducer from './DataSelectionSlice';
import {rkiApi} from './services/rkiApi';
import ScenarioReducer from './ScenarioSlice';
import {scenarioApi} from './services/scenarioApi';

const Store = configureStore({
  reducer: {
    dataSelection: DataSelectionReducer,
    scenarioList: ScenarioReducer,
    [rkiApi.reducerPath]: rkiApi.reducer,
    [scenarioApi.reducerPath]: scenarioApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(rkiApi.middleware, scenarioApi.middleware),
});

export default Store;

export type RootState = ReturnType<typeof Store.getState>;
export type AppDispatch = typeof Store.dispatch;
