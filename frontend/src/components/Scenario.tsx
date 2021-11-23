import React, {useState} from 'react';
import {useAppDispatch} from '../store/hooks';
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
    background_accent: '#d3d2d8',
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
      borderRight: `2px dashed ${theme.colors.background_accent}`,
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
        border: `1px solid ${theme.colors.background_accent}`,
      },

      '& button': {
        boxSizing: 'border-box',
        fontWeight: 'bold',
        color: `${theme.colors.accent}`,
        background: `${theme.colors.background}`,
        border: `1px solid ${theme.colors.background_accent}`,
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
      borderLeft: `1px solid ${theme.colors.background_accent}`,
      flexGrow: 0,
      flexShrink: 0,
      flexBasis: '208px',
      minHeight: '20vh',
      paddingLeft: '12px',
      display: 'flex',

      '& button': {
        color: `${theme.colors.background_accent}`,
        border: `2px dashed ${theme.colors.background_accent}`,
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
        border: `2px solid ${theme.colors.background_accent}`,
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

// function packing simulation information into one object
function createRow(
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

/**
 * Scenario type definition.
 * @typedef {object} Scenario
 * @property {string} id    - The identifier for the scenario.
 * @property {string} label - The label for the scenario displayed to the user.
 * @property {string} color - The Hex-color code for the scenario.
 */
interface Scenario {
  id: string;
  label: string;
  color: string;
}

// list of properties and value/rate pairs for each scenario
// compartment/name, latest, basic, basicRate, medium, mediumRate, big, bigRate, maximum, maximumRate
const properties = [
  createRow('infected', 100, 200, 15, 300, -50, 400, 30, 500, -50),
  createRow('hospitalized', 145, 200, 15, 300, -50, 400, 30, 500, -50),
  createRow('dead', 160, 200, 15, 300, -50, 400, 30, 500, -50),
  createRow('other', 170, 200, 15, 300, -50, 400, 30, 500, -50),
  createRow('property 5', 160, 200, 15, 300, -50, 400, 30, 500, -50),
  createRow('property 6', 170, 200, 15, 300, -50, 400, 30, 500, -50),
  createRow('property 7', 160, 200, 15, 300, -50, 400, 30, 500, -50),
  createRow('property 8', 170, 200, 15, 300, -50, 400, 30, 500, -50),
];

/* === End Sample Data === */

/**
 * React Component to render the Scenario Cards Section
 * @prop {object}     props           - The props for the component.
 * @prop {Scenario[]} props.scenarios - The list of scenarios for the scenario cards.
 * @returns {JSX.Element} JSX Element to render the scenario card container and the scenario cards within.
 * @see ScenarioCard
 */
export default function Scenario(props: {scenarios: Scenario[]}): JSX.Element {
  const {t} = useTranslation();

  const classes = useStyles();
  const dispatch = useAppDispatch();
  const [selectedProperty, setSelectedProperty] = useState('');
  const [activeScenario, setActiveScenario] = useState(0);
  const [expandProperties, setExpandProperties] = useState(false);

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
              // set selected property and dispatch new compartment, new value and new rate for currently selected scenario
              setSelectedProperty(compartment.compartment);
              dispatch(selectCompartment(compartment.compartment));
              dispatch(selectValue(compartment.scenarios[props.scenarios[activeScenario].id].value));
              dispatch(selectRate(compartment.scenarios[props.scenarios[activeScenario].id].rate));
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
        {props.scenarios.map((scn, i) => (
          <ScenarioCard
            key={i}
            scenario={scn}
            active={activeScenario === i}
            data={properties.map((p) => ({
              compartment: p.compartment,
              value: p.scenarios[scn.id].value,
              rate: p.scenarios[scn.id].rate,
            }))}
            selectedProperty={selectedProperty}
            expandProperties={expandProperties}
            onClick={() => {
              // set active scenario to this one and send dispatches
              setActiveScenario(i);
              dispatch(selectScenario(scn.id));
              // if a property has been selected filter properties for selected and dispatch selectValue & selectRate for that property
              if (!(selectedProperty === '')) {
                dispatch(
                  selectValue(properties.filter((x) => x.compartment === selectedProperty)[0].scenarios[scn.id].value)
                );
                dispatch(
                  selectRate(properties.filter((x) => x.compartment === selectedProperty)[0].scenarios[scn.id].rate)
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
