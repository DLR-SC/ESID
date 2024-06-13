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
import {useShownScenarios, useGetSimulationStartValues, useActiveScenarios, isActive, isShown} from './hooks';
import {useGetCaseDataByDistrictQuery} from '../../store/services/caseDataApi';
import {getScenarioPrimaryColor} from '../../util/Theme';

export default function DataCardList(): JSX.Element {
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const shownScenarios = useShownScenarios();
  const activeScenarios = useActiveScenarios();
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
  }, [scenarioListData, dispatch, caseData]);

  // effect to switch active scenario
  useEffect(() => {
    if (activeScenarios.length === 0) {
      dispatch(selectScenario(null));
    } else if (selectedScenario === null || !activeScenarios.find((s) => s.id === selectedScenario)) {
      dispatch(selectScenario(activeScenarios[0].id));
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
      {isShown('casedata', shownScenarios) ? (
        <CaseDataCard
          scenario={{id: 0, name: 'casedata', state: isActive('casedata', activeScenarios) ? 'active' : 'inactive'}}
          selected={selectedScenario === 0}
          startValues={startValues}
          onClick={() => dispatch(selectScenario(0))}
          onToggle={() => dispatch(toggleScenario('casedata'))}
        />
      ) : null}
      {shownScenarios
        .filter((scenario) => scenario.name !== 'casedata')
        .map((scenario) => (
          <ScenarioCard
            key={scenario.id}
            scenario={scenario}
            selected={selectedScenario === scenario.id}
            active={isActive(scenario.name, activeScenarios)}
            color={getScenarioPrimaryColor(scenario.id, theme)}
            startValues={startValues}
            onClick={() => {
              // set active scenario to this one and send dispatches
              dispatch(selectScenario(scenario.id));
            }}
            onToggle={() => {
              dispatch(toggleScenario(scenario.name));
            }}
          />
        ))}
    </Box>
  );
}
