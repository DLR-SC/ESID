import React, {useEffect, useState} from 'react';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {useTheme} from '@mui/material/styles';
import {useTranslation} from 'react-i18next';
import {selectCompartment, selectScenario, setMinMaxDates, toggleScenario} from 'store/DataSelectionSlice';
import ScenarioCard from './ScenarioCard';
import {Box, Button, List, ListItemButton, ListItemText, Typography} from '@mui/material';
import {
  useGetSimulationModelQuery,
  useGetSimulationModelsQuery,
  useGetSimulationsQuery,
} from '../store/services/scenarioApi';
import {setCompartments, setScenarios} from 'store/ScenarioSlice';
import {dateToISOString, Dictionary} from 'util/util';
import {useGetRkiSingleSimulationEntryQuery} from '../store/services/rkiApi';
import {NumberFormatter} from '../util/hooks';

/**
 * React Component to render the Scenario Cards Section
 * @returns {JSX.Element} JSX Element to render the scenario card container and the scenario cards within.
 * @see ScenarioCard
 */
export default function Scenario(): JSX.Element {
  const {t, i18n} = useTranslation();
  const theme = useTheme();

  const dispatch = useAppDispatch();
  const [expandProperties, setExpandProperties] = useState(false);
  const [simulationModelKey, setSimulationModelKey] = useState<string>('unset');
  const [compartmentValues, setCompartmentValues] = useState<Dictionary<number> | null>(null);
  const [scrollTop, setScrollTop] = useState(0);

  function handleScroll(scrollEvent: React.UIEvent<HTMLElement>) {
    setScrollTop(scrollEvent.currentTarget.scrollTop);
  }

  const {formatNumber} = NumberFormatter(i18n.language, 3, 8);

  const getCompartmentValue = (compartment: string): string => {
    if (compartmentValues && compartment in compartmentValues) {
      return formatNumber(compartmentValues[compartment]);
    }
    return t('no-data');
  };

  const scenarioList = useAppSelector((state) => state.scenarioList);
  const selectedScenario = useAppSelector((state) => state.dataSelection.scenario);
  const selectedCompartment = useAppSelector((state) => state.dataSelection.compartment);
  const node = useAppSelector((state) => state.dataSelection.district.ags);
  const startDay = useAppSelector((state) => state.dataSelection.minDate);
  const activeScenarios = useAppSelector((state) => state.dataSelection.activeScenarios);

  const {data: scenarioListData} = useGetSimulationsQuery();
  const {data: simulationModelsData} = useGetSimulationModelsQuery();
  const {data: simulationModelData} = useGetSimulationModelQuery(simulationModelKey, {
    skip: simulationModelKey === 'unset',
  });
  const {data: rkiData} = useGetRkiSingleSimulationEntryQuery(
    {
      node: node,
      day: startDay ?? '',
      group: 'total',
    },
    {skip: !startDay}
  );

  useEffect(() => {
    if (simulationModelsData && simulationModelsData.results.length > 0) {
      const {key} = simulationModelsData.results[0];
      setSimulationModelKey(key);
    }
  }, [simulationModelsData]);

  useEffect(() => {
    if (rkiData) {
      setCompartmentValues(rkiData.results[0].compartments);
    }
  }, [rkiData]);

  useEffect(() => {
    if (simulationModelData) {
      const {compartments} = simulationModelData.results;
      dispatch(setCompartments(compartments));
    }
  }, [simulationModelData, dispatch]);

  useEffect(() => {
    if (scenarioList.compartments.length > 0) {
      dispatch(selectCompartment(scenarioList.compartments[0]));
    }
  }, [dispatch, scenarioList.compartments]);

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
        // It seems, that the simulation data is only available from the second day forward.
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
      } else if (!selectedScenario || !activeScenarios.includes(selectedScenario)) {
        dispatch(selectScenario(activeScenarios[0]));
      }
    }
  }, [activeScenarios, selectedScenario, dispatch]);

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
          flexShrink: 0,
          flexBasis: '274px',
          minHeight: '20vh',
          display: 'flex',
          flexDirection: 'column',
          marginTop: theme.spacing(3),
          borderTop: '2px solid transparent', // invisible border for alignment with the scenario card
          paddingBottom: 0,
          paddingTop: theme.spacing(2),
          paddingLeft: 0,
          paddingRight: 0,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-end',
            height: '3rem',
            marginLeft: 'auto',
            marginRight: 0,
            marginBottom: theme.spacing(1),
            paddingRight: theme.spacing(3),
          }}
        >
          <Typography
            variant='h2'
            sx={{
              textAlign: 'right',
              height: 'min-content',
              fontWeight: 'bold',
              fontSize: '13pt',
            }}
          >
            {startDay ? new Date(startDay).toLocaleDateString(i18n.language) : t('today')}
          </Typography>
        </Box>
        <List
          dense={true}
          disablePadding={true}
          sx={{
            maxHeight: expandProperties ? '248px' : 'auto',
            overflowY: 'auto',
          }}
          onScroll={handleScroll}
        >
          {scenarioList.compartments.map((compartment, i) => (
            // map all compartments to display compartment list
            <ListItemButton
              key={compartment}
              sx={{
                display: expandProperties || i < 4 ? 'flex' : 'none',
                padding: theme.spacing(1),
                paddingLeft: theme.spacing(3),
                paddingRight: theme.spacing(3),
                margin: theme.spacing(0),
                marginTop: theme.spacing(1),
                borderLeft: `2px ${
                  selectedCompartment === compartment ? theme.palette.primary.main : 'transparent'
                } solid`,
                '&.MuiListItemButton-root.Mui-selected': {
                  backgroundColor: theme.palette.background.paper,
                },
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
                  fontWeight: selectedCompartment === compartment ? 'bold' : 'normal',
                  flexGrow: 1,
                  flexBasis: 100,
                }}
              />
              <ListItemText
                primary={getCompartmentValue(compartment)}
                // disable child typography overriding this
                disableTypography={true}
                sx={{
                  typography: 'listElement',
                  color: selectedCompartment === compartment ? theme.palette.text.primary : theme.palette.text.disabled,
                  textAlign: 'right',
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
            margin: theme.spacing(3),
            marginTop: theme.spacing(4),
            marginBottom: 0,
            padding: theme.spacing(1),
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
          marginLeft: theme.spacing(3),
        }}
      >
        {Object.entries(scenarioList.scenarios).map(([, scenario], i) => (
          <ScenarioCard
            key={i}
            scenario={scenario}
            selected={selectedScenario === scenario.id}
            active={!!activeScenarios && activeScenarios.includes(scenario.id)}
            color={theme.custom.scenarios[i][0]}
            selectedProperty={selectedCompartment || ''}
            expandProperties={expandProperties}
            scrollTop={scrollTop}
            startValues={compartmentValues}
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
      <Box
        sx={{
          borderLeft: `1px solid`,
          borderColor: 'divider',
          flexGrow: 0,
          flexShrink: 0,
          flexBasis: '185px',
          minHeight: '20vh',
          paddingLeft: theme.spacing(3),
          paddingRight: theme.spacing(3),
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
            height: '212px',
            margin: theme.spacing(3),
            fontWeight: 'bolder',
            fontSize: '3rem',
            border: `2px ${theme.palette.divider} dashed`,
            borderRadius: '3px',
            color: theme.palette.divider,

            '&:hover': {
              border: `2px ${theme.palette.divider} dashed`,
              background: '#E7E7E7',
            },
          }}
          aria-label={t('scenario.add')}
        >
          +
        </Button>
      </Box>
    </Box>
  );
}
