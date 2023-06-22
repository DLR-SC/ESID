import { combineReducers, configureStore } from '@reduxjs/toolkit';
import DataSelectionReducer from './DataSelectionSlice';
import DataSelectionFilterReducer from './DataSelectionFilter';
import { caseDataApi } from './services/caseDataApi';
import ScenarioReducer from './ScenarioSlice';
import { scenarioApi } from './services/scenarioApi';
import UserPreferenceReducer from './UserPreferenceSlice';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { groupApi } from './services/groupApi';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['dataSelection', 'userPreference', 'scenarioList', 'dataSelectionFilter'],
};

const rootReducer = combineReducers({
  dataSelection: DataSelectionReducer,
  DataSelectionFilter: DataSelectionFilterReducer,
  scenarioList: ScenarioReducer,
  userPreference: UserPreferenceReducer,
  [caseDataApi.reducerPath]: caseDataApi.reducer,
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
    }).concat(caseDataApi.middleware, scenarioApi.middleware),
});

export const Persistor = persistStore(Store);

export type RootState = ReturnType<typeof Store.getState>;
export type AppDispatch = typeof Store.dispatch;
