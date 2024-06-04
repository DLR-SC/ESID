// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {useCallback, useContext, useEffect, useState} from 'react';
import LineChart from './LineChartComponents/LineChart';
import LoadingContainer from './shared/LoadingContainer';
import {useTheme} from '@mui/material';
import {useTranslation} from 'react-i18next';
import {DataContext} from '../DataContext';
import React from 'react';
import {useAppDispatch, useAppSelector} from 'store/hooks';
import {Scenario} from 'store/ScenarioSlice';
import {selectDate} from 'store/DataSelectionSlice';
import {setReferenceDayBottom} from 'store/LayoutSlice';

export default function LineChartContainer() {
  const theme = useTheme();
  const {t: tBackend} = useTranslation('backend');
  const selectedScenario = useAppSelector((state) => state.dataSelection.scenario);
  const selectedCompartment = useAppSelector((state) => state.dataSelection.compartment);
  const groupFilterList = useAppSelector((state) => state.dataSelection.groupFilters);
  const scenarioList = useAppSelector((state) => state.scenarioList);
  const activeScenarios = useAppSelector((state) => state.dataSelection.activeScenarios);
  const selectedDateInStore = useAppSelector((state) => state.dataSelection.date);
  const referenceDay = useAppSelector((state) => state.dataSelection.simulationStart);
  const minDate = useAppSelector((state) => state.dataSelection.minDate);
  const maxDate = useAppSelector((state) => state.dataSelection.maxDate);

  const [selectedDate, setSelectedDate] = useState<string>(selectedDateInStore ? selectedDateInStore : '2021-09-01');
  const [referenceDayb, setReferenceDayb] = useState<number>(0);

  const simulationDataChartName = useCallback(
    (scenario: Scenario) => tBackend(`scenario-names.${scenario.label}`),
    [tBackend]
  );

  const {chartCaseData, chartSimulationData, chartPercentileData, chartGroupFilterData, isChartDataFetching} =
    useContext(DataContext);

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(selectDate(selectedDate));
  }, [selectedDate, dispatch]);

  useEffect(() => {
    if (selectedDateInStore) {
      setSelectedDate(selectedDateInStore);
    }
  }, [selectedDateInStore]);

  useEffect(() => {
    dispatch(setReferenceDayBottom(referenceDayb));
  }, [referenceDayb, dispatch]);

  return (
    <LoadingContainer
      sx={{width: '100%', height: '100%'}}
      show={isChartDataFetching as boolean}
      overlayColor={theme.palette.background.paper}
    >
      <LineChart
        chartId={'lineChart1'}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        setReferenceDayBottom={setReferenceDayb}
        simulationDataChartName={simulationDataChartName}
        simulationData={chartSimulationData}
        caseData={chartCaseData}
        percentileData={chartPercentileData}
        groupFilterData={chartGroupFilterData}
        minDate={minDate}
        maxDate={maxDate}
        selectedScenario={selectedScenario}
        activeScenarios={activeScenarios}
        referenceDay={referenceDay}
        selectedCompartment={selectedCompartment ?? ''}
        groupFilterList={groupFilterList}
        scenarioList={scenarioList}
        localization={{}}
      />
    </LoadingContainer>
  );
}
