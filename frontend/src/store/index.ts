import { configureStore } from '@reduxjs/toolkit';
import DataSelectionReducer from './DataSelectionSlice';
import { rkiApi } from './services/rkiApi';
import ScenarioReducer from './ScenarioSlice';
import { scenarioApi } from './services/scenarioApi';
import UserPreferenceReducer from './UserPreferenceSlice';
import { groupApi } from './services/groupApi';

const Store = configureStore({
  reducer: {
    dataSelection: DataSelectionReducer,
    scenarioList: ScenarioReducer,
    userPreference: UserPreferenceReducer,
    [rkiApi.reducerPath]: rkiApi.reducer,
    [scenarioApi.reducerPath]: scenarioApi.reducer,
    [groupApi.reducerPath]: groupApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(rkiApi.middleware, scenarioApi.middleware, groupApi.middleware),
});

export default Store;

export type RootState = ReturnType<typeof Store.getState>;
export type AppDispatch = typeof Store.dispatch;
