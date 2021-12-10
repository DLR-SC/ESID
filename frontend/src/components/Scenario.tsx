import React, {useState} from 'react';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {useTheme} from '@mui/material/styles';
import {useTranslation} from 'react-i18next';
import {selectCompartment, selectRate, selectScenario, selectValue} from 'store/DataSelectionSlice';
import ScenarioCard from './ScenarioCard';
import {Box, Button, List, ListItemButton, ListItemText, Typography} from '@mui/material';

/* This component displays the pandemic spread depending on different scenarios
 */

/* === Begin Sample Data === */
/**
 * Scenario Property type definition.
 * @typedef {object} PropertyUpdate
 * @property {string} compartment               - The compartment of this property.
 * @property {number} latest                    - The latest/real value for this compartment.
 * @property {object} scenarios                 - The object containing the IDs of the scenarios and their values for this property.
 * @property {string} scenarios.scenario        - The key for the scenarios object (a scenario ID {@link Scenario}).
 * @property {number} scenarios.scenario.value  - The value of the scenario for this compartment.
 * @property {number} scenarios.scenario.rate   - The rate of the scenario for this compartment.
 */
interface PropertyUpdate {
  compartment: string;
  latest: number;
  scenarios: {[scenario: string]: {value: number; rate: number}};
}

/**
 * function packing simulation information into one object (for each compartment)
 * @property {string} compartment - The compartment name.
 * @property {number} latest      - The latest/real value for the compartment.
 * @property {number} basic       - The value for the scenario with id = 'basic'.
 * @property {number} basicRate   - The rate for the scenario with id = 'basic'.
 * @property {number} medium      - The value for the scenario with id = 'medium'.
 * @property {number} mediumRate  - The rate for the scenario with id = 'medium'.
 * @property {number} big         - The value for the scenario with id = 'big'.
 * @property {number} bigRate     - The rate for the scenario with id = 'big'.
 * @property {number} maximum     - The value for the scenario with id = 'maximum'.
 * @property {number} maximumRate - The rate for the scenario with id = 'maximum'.
 * @returns {PropertyUpdate} The packed Object for the compartment.
 */
function packData(
  compartment: string,
  latest: number,
  basic: number,
  basicRate: number,
  medium: number,
  mediumRate: number,
  big: number,
  bigRate: number,
  maximum: number,
  maximumRate: number
): PropertyUpdate {
  return {
    compartment,
    latest,
    scenarios: {
      basic: {value: basic, rate: basicRate},
      medium: {value: medium, rate: mediumRate},
      big: {value: big, rate: bigRate},
      maximum: {value: maximum, rate: maximumRate},
    },
  };
}

// list of properties and value/rate pairs for each scenario
// compartment/name, latest, basic, basicRate, medium, mediumRate, big, bigRate, maximum, maximumRate
const properties = [
  packData('infected', 100, 200, 15, 300, -50, 400, 30, 500, -50),
  packData('hospitalized', 145, 200, 15, 300, -50, 400, 30, 500, -50),
  packData('dead', 160, 200, 15, 300, -50, 400, 30, 500, -50),
  packData('other', 170, 200, 15, 300, -50, 400, 30, 500, -50),
  packData('property 5', 160, 200, 15, 300, -50, 400, 30, 500, -50),
  packData('property 6', 170, 200, 15, 300, -50, 400, 30, 500, -50),
  packData('property 7', 160, 200, 15, 300, -50, 400, 30, 500, -50),
  packData('property 8', 170, 200, 15, 300, -50, 400, 30, 500, -50),
];

/* === End Sample Data === */

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

  const scenarioList = useAppSelector((state) => state.scenarioList);

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
          {properties.map((compartment, i) => (
            // map all compartments to display compartment list
            <ListItemButton
              key={compartment.compartment}
              sx={{
                display: expandProperties || i < 4 ? 'flex' : 'none',
                padding: theme.spacing(1),
                margin: theme.spacing(0),
              }}
              selected={selectedProperty === compartment.compartment}
              onClick={() => {
                // set selected property
                setSelectedProperty(compartment.compartment);
                // dispatch new compartment name
                dispatch(selectCompartment(compartment.compartment));
                // dispatch value & rate (active Scenario is stored as number but compartment.scenarios needs id => list keys & use index)
                dispatch(selectValue(compartment.scenarios[Object.keys(scenarioList)[activeScenario]].value));
                dispatch(selectRate(compartment.scenarios[Object.keys(scenarioList)[activeScenario]].rate));
              }}
            >
              <ListItemText
                primary={compartment.compartment}
                sx={{
                  flexGrow: 1,
                  flexBasis: 100,
                }}
              />
              <ListItemText
                primary={compartment.latest}
                sx={{
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
              properties.findIndex((o) => {
                return o.compartment === selectedProperty;
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
        {Object.entries(scenarioList).map(([scn_id, scn_info], i) => (
          <ScenarioCard
            key={i}
            scenario={scn_info}
            active={activeScenario === i}
            data={properties.map((p) => ({
              compartment: p.compartment,
              value: p.scenarios[scn_id].value,
              rate: p.scenarios[scn_id].rate,
            }))}
            selectedProperty={selectedProperty}
            expandProperties={expandProperties}
            onClick={() => {
              // set active scenario to this one and send dispatches
              setActiveScenario(i);
              dispatch(selectScenario(scn_id));
              // if a property has been selected filter properties for selected and dispatch selectValue & selectRate for that property
              if (!(selectedProperty === '')) {
                dispatch(
                  selectValue(properties.filter((x) => x.compartment === selectedProperty)[0].scenarios[scn_id].value)
                );
                dispatch(
                  selectRate(properties.filter((x) => x.compartment === selectedProperty)[0].scenarios[scn_id].rate)
                );
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
