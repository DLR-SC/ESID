import Box from '@mui/material/Box';
import {CaseDataCard} from './CaseDataCard';
import {selectScenario, setMinMaxDates, toggleScenario} from '../../store/DataSelectionSlice';
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

  useEffect(() => {
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

        dispatch(setMinMaxDates({minDate: dateToISOString(startDay), maxDate: dateToISOString(endDay)}));
      }
    }
  }, [activeScenarios, scenarioListData, dispatch]);

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
          color={theme.custom.scenarios[i][0]}
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
