// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import Box from '@mui/material/Box';
import {CaseDataCard} from './CaseDataCard';
import {selectScenario, setMinMaxDates, setStartDate, toggleScenario} from '../../store/DataSelectionSlice';
import {ScenarioCard} from './ScenarioCard';
import React, {useEffect, useState} from 'react';
import {dateToISOString} from '../../util/util';
import {useAppDispatch, useAppSelector} from '../../store/hooks';
import {useTheme} from '@mui/material/styles';
import {
  useGetSimulationModelQuery,
  useGetSimulationModelsQuery,
  useGetSimulationsQuery,
} from '../../store/services/scenarioApi';
import {setCompartments, setScenarios} from '../../store/ScenarioSlice';
import {useGetSimulationStartValues} from './hooks';
import {useGetCaseDataByDistrictQuery} from '../../store/services/caseDataApi';

export default function DataCardList(): JSX.Element {
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const scenarioList = useAppSelector((state) => state.scenarioList);
  const activeScenarios = useAppSelector((state) => state.dataSelection.activeScenarios);
  const selectedScenario = useAppSelector((state) => state.dataSelection.scenario);

  const [simulationModelKey, setSimulationModelKey] = useState<string>('unset');

  const {data: scenarioListData} = useGetSimulationsQuery();
  const {data: simulationModelsData} = useGetSimulationModelsQuery();
  const {data: simulationModelData} = useGetSimulationModelQuery(simulationModelKey, {
    skip: simulationModelKey === 'unset',
  });

  // This is a temporary solution to get the start and end day of the case data.
  const caseData = useGetCaseDataByDistrictQuery({node: '00000', groups: null, compartments: null});

  const startValues = useGetSimulationStartValues();

  useEffect(() => {
    if (simulationModelsData && simulationModelsData.results.length > 0) {
      const {key} = simulationModelsData.results[0];
      setSimulationModelKey(key);
    }
  }, [simulationModelsData]);

  useEffect(() => {
    if (simulationModelData) {
      const {compartments} = simulationModelData.results;
      dispatch(setCompartments(compartments));
    }
  }, [simulationModelData, dispatch]);

  // This effect calculates the start and end days from the case and scenario data.
  useEffect(() => {
    let minDate: string | null = null;
    let maxDate: string | null = null;

    if (scenarioListData) {
      const scenarios = scenarioListData.results.map((scenario) => ({id: scenario.id, label: scenario.description}));
      dispatch(setScenarios(scenarios));

      //activate all scenarios initially
      if (!activeScenarios) {
        scenarios.forEach((scenario) => {
          dispatch(toggleScenario(scenario.id));
        });
      }

      if (scenarios.length > 0) {
        // The simulation data (results) are only available one day after the start day onward.
        const startDay = new Date(scenarioListData.results[0].startDay);
        startDay.setUTCDate(startDay.getUTCDate() + 1);

        const endDay = new Date(startDay);
        endDay.setDate(endDay.getDate() + scenarioListData.results[0].numberOfDays - 1);

        minDate = dateToISOString(startDay);
        maxDate = dateToISOString(endDay);

        dispatch(setStartDate(minDate));
      }
    }

    if (caseData?.data) {
      const entries = caseData.data.results.map((entry) => entry.day).sort((a, b) => a.localeCompare(b));

      const firstCaseDataDay = entries[0];
      if (!minDate) {
        minDate = firstCaseDataDay;
        dispatch(setStartDate(minDate));
      } else {
        minDate = minDate.localeCompare(firstCaseDataDay) < 0 ? minDate : firstCaseDataDay;
      }

      const lastCaseDataDay = entries.slice(-1)[0];
      if (!maxDate) {
        maxDate = lastCaseDataDay;
      } else {
        maxDate = maxDate.localeCompare(lastCaseDataDay) > 0 ? maxDate : lastCaseDataDay;
      }
    }

    if (minDate && maxDate) {
      dispatch(setMinMaxDates({minDate, maxDate}));
    }
  }, [activeScenarios, scenarioListData, dispatch, caseData]);

  //effect to switch active scenario
  useEffect(() => {
    if (activeScenarios) {
      if (activeScenarios.length == 0) {
        dispatch(selectScenario(null));
      } else if (selectedScenario === null || !activeScenarios.includes(selectedScenario)) {
        dispatch(selectScenario(activeScenarios[0]));
      }
    }
  }, [activeScenarios, selectedScenario, dispatch]);

  return (
    <Box
      id='scenario-view-scenario-card-list'
      sx={{
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: '100%',
        display: 'flex',
        overflowX: 'auto',
        marginLeft: theme.spacing(3),
        minWidth: '400px',
      }}
    >
      <CaseDataCard
        selected={selectedScenario === 0}
        active={!!activeScenarios && activeScenarios.includes(0)}
        startValues={startValues}
        onClick={() => dispatch(selectScenario(0))}
        onToggle={() => dispatch(toggleScenario(0))}
      />
      {Object.entries(scenarioList.scenarios).map(([, scenario], i) => (
        <ScenarioCard
          key={scenario.id}
          scenario={scenario}
          selected={selectedScenario === scenario.id}
          active={!!activeScenarios && activeScenarios.includes(scenario.id)}
          color={theme.custom.scenarios[(i + 1) % theme.custom.scenarios.length][0]}
          startValues={startValues}
          onClick={() => {
            // set active scenario to this one and send dispatches
            dispatch(selectScenario(scenario.id));
          }}
          onToggle={() => {
            dispatch(toggleScenario(scenario.id));
          }}
        />
      ))}
    </Box>
  );
}
