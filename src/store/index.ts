// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {combineReducers, configureStore} from '@reduxjs/toolkit';
import DataSelectionReducer from './DataSelectionSlice';
import {scenarioApi} from './services/scenarioApi';
import UserPreferenceReducer from './UserPreferenceSlice';
import {WebStorage, persistReducer, persistStore} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import LayoutReducer from './LayoutSlice';
import AuthReducer from './AuthSlice';
import UserOnboardingReducer from './UserOnboardingSlice';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import {idpApi} from './services/idpApi';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['dataSelection', 'userPreference', 'userOnboarding', 'auth'],
  stateReconciler: autoMergeLevel2,
};

const rootReducer = combineReducers({
  dataSelection: DataSelectionReducer,
  userPreference: UserPreferenceReducer,
  layoutSlice: LayoutReducer,
  userOnboarding: UserOnboardingReducer,
  auth: AuthReducer,
  [scenarioApi.reducerPath]: scenarioApi.reducer,
  [idpApi.reducerPath]: idpApi.reducer,
});

const persistedReducer = persistReducer(
  persistConfig as {key: 'root'; storage: WebStorage; whitelist: Array<string>},
  rootReducer
);

export const Store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }).concat(scenarioApi.middleware, idpApi.middleware),
});

export const Persistor = persistStore(Store);

export type RootState = ReturnType<typeof Store.getState>;
export type AppDispatch = typeof Store.dispatch;
