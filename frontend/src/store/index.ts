// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {combineReducers, configureStore} from '@reduxjs/toolkit';
import DataSelectionReducer from './DataSelectionSlice';
import {caseDataApi} from './services/caseDataApi';
import ScenarioReducer from './ScenarioSlice';
import {scenarioApi} from './services/scenarioApi';
import UserPreferenceReducer from './UserPreferenceSlice';
import {persistReducer, persistStore} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import {groupApi} from './services/groupApi';
import LayoutReducer from './LayoutSlice';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['dataSelection', 'userPreference'],
};

const rootReducer = combineReducers({
  dataSelection: DataSelectionReducer,
  scenarioList: ScenarioReducer,
  userPreference: UserPreferenceReducer,
  layoutSlice: LayoutReducer,
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
    }).concat(caseDataApi.middleware, scenarioApi.middleware, groupApi.middleware),
});

export const Persistor = persistStore(Store);

export type RootState = ReturnType<typeof Store.getState>;
export type AppDispatch = typeof Store.dispatch;
