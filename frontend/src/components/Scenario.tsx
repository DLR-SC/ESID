import React, {useState} from 'react';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {createStyles, makeStyles} from '@mui/styles';
import {useTranslation} from 'react-i18next';
import {selectCompartment, selectRate, selectScenario, selectValue} from 'store/DataSelectionSlice';
import ScenarioCard from './ScenarioCard';

/* This component displays the pandemic spread depending on different scenarios
 */

// css theme variables
const theme = {
  colors: {
    accent: '#1976D2',
    background: '#F8F8F8',
    backgroundAccent: '#d3d2d8',
  },
};

// create css styles
const useStyles = makeStyles(() =>
  createStyles({
    root: {
      display: 'flex',
      cursor: 'default',
      background: theme.colors.background,
    },

    scenario_header: {
      borderRight: `2px dashed ${theme.colors.backgroundAccent}`,
      flexGrow: 0,
      flexShrink: 1,
      flexBasis: '276px',
      minHeight: '20vh',
      display: 'flex',
      flexDirection: 'column',
      padding: '12px',
      paddingTop: '26px',

      '& span': {
        width: '100%',
        textAlign: 'right',
        fontWeight: 'bold',
        lineHeight: '1.5rem',
        minHeight: '3rem',
        marginBottom: '8px',
      },

      '& ul': {
        display: 'flex',
        justifyContent: 'space-between',
        listStyleType: 'none',
        padding: '7px',
        margin: '0px',
        borderStyle: 'solid hidden solid hidden',
        border: `1px solid ${theme.colors.background}`,
        fontWeight: 'normal',
      },

      '& ul:hover': {
        borderStyle: 'solid hidden solid hidden',
        border: `1px solid ${theme.colors.backgroundAccent}`,
      },

      '& button': {
        boxSizing: 'border-box',
        fontWeight: 'bold',
        color: `${theme.colors.accent}`,
        background: `${theme.colors.background}`,
        border: `1px solid ${theme.colors.backgroundAccent}`,
        borderRadius: '5px',
        margin: '8px',
      },

      '& button:hover': {
        border: `1px solid ${theme.colors.accent}`,
      },
    },

    scenario_container: {
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: '100%',
      display: 'flex',
      overflowX: 'auto',
    },

    scenario_footer: {
      borderLeft: `1px solid ${theme.colors.backgroundAccent}`,
      flexGrow: 0,
      flexShrink: 0,
      flexBasis: '208px',
      minHeight: '20vh',
      paddingLeft: '12px',
      display: 'flex',

      '& button': {
        background: `${theme.colors.background}`,
        color: `${theme.colors.backgroundAccent}`,
        border: `2px dashed ${theme.colors.backgroundAccent}`,
        flexGrow: 0,
        flexShrink: 0,
        flexBasis: '160px',
        minHeight: '220px',
        margin: '12px',
        fontWeight: 'bolder',
        fontSize: '3rem',
        transition: '0.3s',
      },

      '& button:hover': {
        border: `2px solid ${theme.colors.backgroundAccent}`,
        color: `${theme.colors.accent}`,
      },
    },
  })
);

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

  const classes = useStyles();
  const dispatch = useAppDispatch();
  const [selectedProperty, setSelectedProperty] = useState('');
  const [activeScenario, setActiveScenario] = useState(0);
  const [expandProperties, setExpandProperties] = useState(false);

  const scenarioList = useAppSelector((state) => state.scenarioList);

  return (
    <div className={classes.root}>
      <div className={classes.scenario_header}>
        <span>{t('today')}</span>
        {properties.map((compartment, i) => (
          <ul
            key={compartment.compartment}
            style={{
              display: expandProperties || i < 4 ? 'flex' : 'none',
              fontWeight: compartment.compartment === selectedProperty ? 'bold' : 'normal',
            }}
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
            <li>{compartment.compartment}</li>
            <li>{compartment.latest}</li>
          </ul>
        ))}
        <button
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
        </button>
      </div>
      <div className={classes.scenario_container}>
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
      </div>
      <div className={classes.scenario_footer}>
        <button aria-label={t('scenario.add')}>+</button>
      </div>
    </div>
  );
}
