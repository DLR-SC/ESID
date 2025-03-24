// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {combineReducers, configureStore} from '@reduxjs/toolkit';
import UserPreferenceReducer from './UserPreferenceSlice';
import InspireReducer from './inspireGridSlice';
import PandemosFilterReducer from './PandemosFilterSlice';

const rootReducer = combineReducers({
  userPreference: UserPreferenceReducer,
  inspireGrid: InspireReducer,
  pandemosFilter: PandemosFilterReducer,
});

export const Store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware()
});

export type RootState = ReturnType<typeof Store.getState>;
export type AppDispatch = typeof Store.dispatch;
