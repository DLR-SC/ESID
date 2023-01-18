import {combineReducers, configureStore} from '@reduxjs/toolkit';
import DataSelectionReducer from './DataSelectionSlice';
import {rkiApi} from './services/rkiApi';
import ScenarioReducer from './ScenarioSlice';
import {scenarioApi} from './services/scenarioApi';
import UserPreferenceReducer from './UserPreferenceSlice';
import {persistReducer, persistStore} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { groupApi } from './services/groupApi';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['dataSelection', 'userPreference', 'scenarioList'],
};

const rootReducer = combineReducers({
  dataSelection: DataSelectionReducer,
  scenarioList: ScenarioReducer,
  userPreference: UserPreferenceReducer,
  [rkiApi.reducerPath]: rkiApi.reducer,
  [scenarioApi.reducerPath]: scenarioApi.reducer,
  [groupApi.reducerPath]: groupApi.reducer,
});
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const Store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }).concat(rkiApi.middleware, scenarioApi.middleware, groupApi.middleware),
});

export const Persistor = persistStore(Store);

export type RootState = ReturnType<typeof Store.getState>;
export type AppDispatch = typeof Store.dispatch;
