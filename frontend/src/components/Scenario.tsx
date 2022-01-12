import React, {useState} from 'react';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {useTheme} from '@mui/material/styles';
import {useTranslation} from 'react-i18next';
import {selectCompartment, selectDate, selectScenario} from 'store/DataSelectionSlice';
import ScenarioCard from './ScenarioCard';
import {Box, Button, List, ListItemButton, ListItemText, Typography} from '@mui/material';
import {
  useGetSimulationModelQuery,
  useGetSimulationModelsQuery,
  useGetSimulationsQuery,
} from '../store/services/scenarioApi';
import {useEffect} from 'react';
import {setCompartments, setScenarios} from 'store/ScenarioSlice';
import {dateToISOString} from 'util/util';

/**
 * React Component to render the Scenario Cards Section
 * @returns {JSX.Element} JSX Element to render the scenario card container and the scenario cards within.
 * @see ScenarioCard
 */
export default function Scenario(): JSX.Element {
  const {t} = useTranslation();
  const theme = useTheme();

  const dispatch = useAppDispatch();
  const [expandProperties, setExpandProperties] = useState(false);

  const [simulationModelId, setSimulationModelId] = useState(0);

  const scenarioList = useAppSelector((state) => state.scenarioList);
  const activeScenario = useAppSelector((state) => state.dataSelection.scenario);
  const selectedCompartment = useAppSelector((state) => state.dataSelection.compartment);

  const {data: scenarioListData} = useGetSimulationsQuery();
  const {data: simulationModelsData} = useGetSimulationModelsQuery();
  const {data: simulationModelData} = useGetSimulationModelQuery(simulationModelId);

  useEffect(() => {
    if (simulationModelsData && simulationModelsData.results.length > 0) {
      const id = Number.parseInt(simulationModelsData.results[0].url.slice(-2, -1), 10);
      setSimulationModelId(id);
    } else {
      console.warn('Could not fetch simulation model data!');
    }
  }, [simulationModelsData]);

  useEffect(() => {
    if (simulationModelData) {
      dispatch(setCompartments(simulationModelData.compartments));

      if (simulationModelData.compartments.length > 0) {
        dispatch(selectCompartment(simulationModelData.compartments[0]));
      }
    } else {
      console.warn('Could not fetch simulation model data!');
    }
  }, [simulationModelData, dispatch]);

  useEffect(() => {
    if (scenarioListData) {
      const scenarios = scenarioListData.results.map((scenario) => ({id: scenario.id, label: scenario.description}));
      dispatch(setScenarios(scenarios));

      if (scenarios.length > 0) {
        // It seems, that the simulation data is only available from the second day forward.
        const day = new Date(scenarioListData.results[0].startDay);
        day.setDate(day.getDate() + 1);

        dispatch(selectDate(dateToISOString(day)));
        dispatch(selectScenario(scenarios[0].id));
      }
    }
  }, [scenarioListData, dispatch]);

  return (
    <Box
      sx={{
        display: 'flex',
        cursor: 'default',
        background: theme.palette.background.default,
      }}
    >
      <Box
        sx={{
          borderRight: `2px dashed ${theme.palette.divider}`,
          flexGrow: 0,
          flexShrink: 1,
          flexBasis: '276px',
          minHeight: '20vh',
          display: 'flex',
          flexDirection: 'column',
          padding: theme.spacing(3),
          paddingTop: theme.spacing(4),
        }}
      >
        <Typography
          variant='h1'
          sx={{
            width: '100%',
            textAlign: 'right',
            minHeight: '3rem',
            marginBottom: theme.spacing(3),
          }}
        >
          {t('today')}
        </Typography>
        <List dense={true} disablePadding={true}>
          {scenarioList.compartments.map((compartment, i) => (
            // map all compartments to display compartment list
            <ListItemButton
              key={compartment}
              sx={{
                display: expandProperties || i < 4 ? 'flex' : 'none',
                padding: theme.spacing(1),
                margin: theme.spacing(0),
              }}
              selected={selectedCompartment === compartment}
              onClick={() => {
                // dispatch new compartment name
                dispatch(selectCompartment(compartment));
              }}
            >
              <ListItemText
                primary={compartment}
                // disable child typography overriding this
                disableTypography={true}
                sx={{
                  typography: 'listElement',
                  flexGrow: 1,
                  flexBasis: 100,
                }}
              />
              <ListItemText
                primary={0} // TODO
                // disable child typography overriding this
                disableTypography={true}
                sx={{
                  typography: 'listElement',
                  flexGrow: 1,
                }}
              />
            </ListItemButton>
          ))}
        </List>
        <Button
          variant='outlined'
          color='primary'
          sx={{
            margin: theme.spacing(2),
          }}
          aria-label={t('scenario.more')}
          onClick={() => {
            setExpandProperties(!expandProperties);
            // unselect Property if hidden through show less button
            if (
              scenarioList.compartments.findIndex((o) => {
                return o === selectedCompartment;
              }) > 4
            ) {
              if (scenarioList.compartments.length > 0) {
                dispatch(selectCompartment(scenarioList.compartments[0]));
              }
            }
          }}
        >
          {expandProperties ? t('less') : t('more')}
        </Button>
      </Box>
      <Box
        sx={{
          flexGrow: 1,
          flexShrink: 1,
          flexBasis: '100%',
          display: 'flex',
          overflowX: 'auto',
        }}
      >
        {Object.entries(scenarioList.scenarios).map(([, scenario], i) => (
          <ScenarioCard
            key={i}
            scenario={scenario}
            active={activeScenario === i + 1}
            color={theme.custom.scenarios[i]}
            selectedProperty={selectedCompartment}
            expandProperties={expandProperties}
            onClick={() => {
              // set active scenario to this one and send dispatches
              dispatch(selectScenario(scenario.id));
            }}
          />
        ))}
      </Box>
      <Box
        sx={{
          borderLeft: `1px solid`,
          borderColor: 'divider',
          flexGrow: 0,
          flexShrink: 0,
          flexBasis: '208px',
          minHeight: '20vh',
          paddingLeft: theme.spacing(3),
          display: 'flex',
        }}
      >
        <Button
          variant='outlined'
          color='success'
          sx={{
            flexGrow: 0,
            flexShrink: 0,
            flexBasis: '160px',
            minHeight: '220px',
            margin: theme.spacing(3),
            fontWeight: 'bolder',
            fontSize: '3rem',
          }}
          aria-label={t('scenario.add')}
        >
          +
        </Button>
      </Box>
    </Box>
  );
}
