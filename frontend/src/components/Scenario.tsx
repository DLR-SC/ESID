import React, {useState} from 'react';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {useTheme} from '@mui/material/styles';
import {useTranslation} from 'react-i18next';
import {selectCompartment, selectRate, selectScenario, selectValue} from 'store/DataSelectionSlice';
import ScenarioCard from './ScenarioCard';
import {Box, Button, List, ListItemButton, ListItemText, Typography} from '@mui/material';
import {
  useGetSimulationModelQuery,
  useGetSimulationModelsQuery,
  useGetSimulationsQuery,
} from '../store/services/scenarioApi';
import {useEffect} from 'react';
import {setScenarios} from 'store/ScenarioSlice';

/* This component displays the pandemic spread depending on different scenarios
 */

/**
 * React Component to render the Scenario Cards Section
 * @returns {JSX.Element} JSX Element to render the scenario card container and the scenario cards within.
 * @see ScenarioCard
 */
export default function Scenario(): JSX.Element {
  const {t} = useTranslation();
  const theme = useTheme();

  const dispatch = useAppDispatch();
  const [selectedProperty, setSelectedProperty] = useState('');
  const [activeScenario, setActiveScenario] = useState(0);
  const [expandProperties, setExpandProperties] = useState(false);

  const [simulationModelId, setSimulationModelId] = useState(0);

  const [compartments, setCompartments] = useState<Array<string>>([]);

  const scenarioList = useAppSelector((state) => state.scenarioList);

  const {data: scenarioListData} = useGetSimulationsQuery(null);
  const {data: simulationModelsData} = useGetSimulationModelsQuery(null);
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
      setCompartments(simulationModelData.compartments);
    } else {
      console.warn('Could not fetch simulation model data!');
    }
  }, [simulationModelData]);

  useEffect(() => {
    if (scenarioListData) {
      const scenarios = scenarioListData.results.map((scenario) => ({id: scenario.id, label: scenario.description}));
      dispatch(setScenarios(scenarios));
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
          {compartments.map((compartment, i) => (
            // map all compartments to display compartment list
            <ListItemButton
              key={compartment}
              sx={{
                display: expandProperties || i < 4 ? 'flex' : 'none',
                padding: theme.spacing(1),
                margin: theme.spacing(0),
              }}
              selected={selectedProperty === compartment}
              onClick={() => {
                // set selected property
                setSelectedProperty(compartment);
                // dispatch new compartment name
                dispatch(selectCompartment(compartment));
                // dispatch value & rate (active Scenario is stored as number but compartment.scenarios needs id => list keys & use index)
                dispatch(selectValue(0)); // TODO
                dispatch(selectRate(0)); // TODO
              }}
            >
              <ListItemText
                primary={compartment}
                sx={{
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
              compartments.findIndex((o) => {
                return o === selectedProperty;
              }) > 4
            ) {
              setSelectedProperty('');
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
            active={activeScenario === i}
            data={compartments.map((p) => ({
              compartment: p,
              value: 0, // TODO
              rate: 0, // TODO
            }))}
            selectedProperty={selectedProperty}
            expandProperties={expandProperties}
            onClick={() => {
              // set active scenario to this one and send dispatches
              setActiveScenario(i);
              dispatch(selectScenario(scenario.id));
              // if a property has been selected filter properties for selected and dispatch selectValue & selectRate for that property
              if (!(selectedProperty === '')) {
                dispatch(selectValue(0)); // TODO
                dispatch(selectRate(0)); // TODO
              }
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
