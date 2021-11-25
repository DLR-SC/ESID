import {configureStore} from '@reduxjs/toolkit';
import DataSelectionReducer from './DataSelectionSlice';
import ScenarioReducer from './ScenarioSlice';

const Store = configureStore({
  reducer: {
    dataSelection: DataSelectionReducer,
    scenarioList: ScenarioReducer,
  },
});

export default Store;

export type RootState = ReturnType<typeof Store.getState>;
export type AppDispatch = typeof Store.dispatch;
