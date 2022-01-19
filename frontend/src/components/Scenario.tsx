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
import {useGetRkiSingleSimulationEntryQuery} from '../store/services/rkiApi';

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
  const [simulationModelId, setSimulationModelId] = useState(0);
  const [startDay, setStartDay] = useState<Date | null>();
  const [compartmentValues, setCompartmentValues] = useState<{[key: string]: string | number; day: string} | null>(
    null
  );
  const [numberFormat] = useState(new Intl.NumberFormat(i18n.language, {
    minimumSignificantDigits: 1,
    maximumSignificantDigits: 3
  }));

  const getCompartmentValue = (compartment: string): string => {
    if (compartmentValues && compartment in compartmentValues) {
      const value = compartmentValues[compartment];
      if (typeof value === 'number') {
        return numberFormat.format(value);
      }
    }

    return 'No Data';
  };

  const scenarioList = useAppSelector((state) => state.scenarioList);
  const activeScenario = useAppSelector((state) => state.dataSelection.scenario);
  const selectedCompartment = useAppSelector((state) => state.dataSelection.compartment);
  const node = useAppSelector((state) => state.dataSelection.district.ags);

  const {data: scenarioListData} = useGetSimulationsQuery();
  const {data: simulationModelsData} = useGetSimulationModelsQuery();
  const {data: simulationModelData} = useGetSimulationModelQuery(simulationModelId);
  const {data: rkiData} = useGetRkiSingleSimulationEntryQuery({
    node,
    day: startDay ? dateToISOString(startDay) : '',
    group: 'total',
  });

  useEffect(() => {
    if (simulationModelsData && simulationModelsData.results.length > 0) {
      const id = Number.parseInt(simulationModelsData.results[0].url.slice(-2, -1), 10);
      setSimulationModelId(id);
    } else {
      console.warn('Could not fetch simulation model data!');
    }
  }, [simulationModelsData]);

  useEffect(() => {
    if (rkiData) {
      setCompartmentValues(rkiData.results[0]);
    }
  }, [rkiData]);

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
        setStartDay(day);

        const endDay = new Date(day);
        endDay.setDate(endDay.getDate() + scenarioListData.results[0].numberOfDays);
        dispatch(selectDate(dateToISOString(endDay)));
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
            {startDay ? startDay.toLocaleDateString() : t('today')}
          </Typography>
        </Box>
        <List dense={true} disablePadding={true}>
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
            active={activeScenario === i + 1}
            color={theme.custom.scenarios[i]}
            selectedProperty={selectedCompartment}
            expandProperties={expandProperties}
            startValues={compartmentValues}
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
