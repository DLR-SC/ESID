// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {useContext, useEffect, useMemo, useState} from 'react';
import LineChart from './LineChart';
import LoadingContainer from '../shared/LoadingContainer';
import {useTheme} from '@mui/material';
import {DataContext} from '../../DataContext';
import {useAppDispatch, useAppSelector} from 'store/hooks';
import {selectDate} from 'store/DataSelectionSlice';
import {setReferenceDayBottom} from 'store/LayoutSlice';
import {useTranslation} from 'react-i18next';
import {LineChartSettings} from './LineChartSettingsComponents/LineChartSettings';
import {Dictionary} from 'util/util';
import {HorizontalThreshold} from 'types/horizontalThreshold';
import {setHorizontalYAxisThresholds} from 'store/UserPreferenceSlice';

export default function LineChartContainer() {
  const {t} = useTranslation('backend');
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const {isChartDataFetching, chartData} = useContext(DataContext);

  const selectedCompartment = useAppSelector((state) => state.dataSelection.compartment);
  const selectedDistrict = useAppSelector((state) => state.dataSelection.district);
  const selectedDateInStore = useAppSelector((state) => state.dataSelection.date);
  const storeHorizontalThresholds = useAppSelector((state) => state.userPreference.horizontalYAxisThresholds);
  const referenceDay = useAppSelector((state) => state.dataSelection.simulationStart);
  const minDate = useAppSelector((state) => state.dataSelection.minDate);
  const maxDate = useAppSelector((state) => state.dataSelection.maxDate);

  const [selectedDate, setSelectedDate] = useState<string>(selectedDateInStore ?? '2024-08-07');
  const [referenceDayBottomPosition, setReferenceDayBottomPosition] = useState<number>(0);
  const [horizontalThresholds, setHhorizontalThresholds] =
    useState<Dictionary<HorizontalThreshold>>(storeHorizontalThresholds);

  const yAxisLabel = useMemo(() => {
    return t(`infection-states.${selectedCompartment}`);
  }, [selectedCompartment, t]);

  // Set horizontal thresholds in store
  useEffect(() => {
    dispatch(setHorizontalYAxisThresholds(horizontalThresholds));
  }, [horizontalThresholds, dispatch]);

  // Set selected date in store
  useEffect(() => {
    dispatch(selectDate(selectedDate));
    // This effect should only run when the selectedDate changes
  }, [selectedDate, dispatch]);

  // Set selected date in state when it changes in store
  useEffect(() => {
    if (selectedDateInStore) {
      setSelectedDate(selectedDateInStore);
    }
    // This effect should only run when the selectedDateInStore changes
  }, [selectedDateInStore]);

  // Set reference day in store
  useEffect(() => {
    dispatch(setReferenceDayBottom(referenceDayBottomPosition));
    // This effect should only run when the referenceDay changes
  }, [referenceDayBottomPosition, dispatch]);

  return (
    <LoadingContainer
      sx={{width: '100%', height: '100%'}}
      show={isChartDataFetching}
      overlayColor={theme.palette.background.paper}
    >
      <LineChart
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        setReferenceDayBottom={setReferenceDayBottomPosition}
        lineChartData={chartData}
        minDate={minDate}
        maxDate={maxDate}
        referenceDay={referenceDay}
        yAxisLabel={yAxisLabel}
        horizontalYAxisThreshold={horizontalThresholds[`${selectedDistrict.ags}-${selectedCompartment}`]?.threshold}
      />
      <LineChartSettings
        selectedDistrict={selectedDistrict}
        selectedCompartment={selectedCompartment ?? ''}
        horizontalThresholds={horizontalThresholds}
        setHorizontalThresholds={setHhorizontalThresholds}
      />
    </LoadingContainer>
  );
}
