import React, {useState} from 'react';
import {useAppDispatch} from '../store/hooks';
import {createStyles, makeStyles} from '@mui/styles';
import {useTranslation} from 'react-i18next';
import {selectCompartment, selectRate, selectScenario} from 'store/DataSelectionSlice';
//import {Theme} from '@mui/material/styles';

/* This component displays the pandemic spread depending on different scenarios
 */

// create css styles
const useStyles = makeStyles((/*theme: Theme*/) =>
  createStyles({
    root: {
      display: 'flex',
      cursor: 'default',

      '& .scenario-header': {
        background: '#F8F8F8', //theme.palette.background.default,
        borderRight: '2px dashed #d3d2d8', // background accent color
        flex: '0 1 276px',
        minHeight: '20vh',
        display: 'flex',
        flexDirection: 'column',
        padding: '12px',
        paddingTop: '26px',
      },

      '& .scenario-header span': {
        width: '100%',
        textAlign: 'right',
        fontWeight: 'bold',
        lineHeight: '1.5rem',
        minHeight: '3rem',
        marginBottom: '8px',
      },

      '& .scenario-header ul': {
        display: 'flex',
        justifyContent: 'space-between',
        listStyleType: 'none',
        padding: '7px',
        margin: '0px',
        borderStyle: 'solid hidden solid hidden',
        border: '1px solid #F8F8F8', //theme.palette.background.default,
        fontWeight: 'normal',
      },

      '& .scenario-header ul:hover': {
        borderStyle: 'solid hidden solid hidden',
        border: '1px solid #d3d2d8', // background accent color
      },

      '& .scenario-header button': {
        boxSizing: 'border-box',
        fontWeight: 'bold',
        color: '#1976D2', // accent color
        background: '#F8F8F8', //theme.palette.background.default,
        border: '1px solid #d3d2d8', // background accent color
        borderRadius: '5px',
        maxWidth: '30%',
        margin: '8px',
      },

      '& .scenario-header button:hover': {
        border: '1px solid #1976D2', // accent color'
      },

      '& .scenario-container': {
        background: '#F8F8F8', //theme.palette.background.default,
        flex: '1 1 100%',
        display: 'flex',
        overflowX: 'auto',
      },

      '& .scenario-card': {
        flex: '0 0 160px',
        boxSizing: 'border-box',
        margin: '12px',
        padding: '12px',
        background: '#F8F8F8', //theme.palette.background.default,
      },

      '& .scenario-card header': {
        fontWeight: 'bold',
        lineHeight: '1.5rem',
        minHeight: '3rem',
      },

      '& .scenario-card ul': {
        display: 'flex',
      },

      '& .scenario-card li': {
        listStyleType: 'none',
        flex: '1 1 100%',
      },

      '& .scenario-footer': {
        background: '#F8F8F8', //theme.palette.background.default,
        borderLeft: '1px solid #d3d2d8', // background accent color
        flex: '0 0 208px',
        minHeight: '20vh',
        paddingLeft: '12px',
        display: 'flex',
      },

      '& .scenario-footer button': {
        background: '#F8F8F8', //theme.palette.background.default,
        color: '#d3d2d8', // background accent color
        border: '2px dashed #d3d2d8', // background accent color
        flex: '0 0 160px',
        minHeight: '220px',
        margin: '12px',
        fontWeight: 'bolder',
        fontSize: '3rem',
        transition: '0.3s',
      },

      '& .scenario-footer button:hover': {
        border: '2px solid #d3d2d8', // background accent color
        color: '#1976D2', // accent color
      },
    },
  }));

/* === Begin Sample Data === */
// function packing simulation information into one object
interface PropertyUpdate {
  compartment: string;
  latest: number;
  scenarios: {[scenario: string]: {value: number; rate: number}};
}

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

// list of Name and Color for Scenario Cards
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

// individual Scenario Card
function ScenarioCard(props: {
  scenario: Scenario;
  key: number;
  active: boolean;
  data: {compartment: string; value: number; rate: number}[];
  selectedProperty: string;
  expandProperties: boolean;
  onClick: () => void;
}): JSX.Element {
  return (
    <div
      className='scenario-card'
      style={{
        border: `2px solid ${props.scenario.color}`,
        color: props.scenario.color,
        boxShadow: props.active ? '0px 0px 12px 3px' : 'none',
      }}
      onClick={() => props.onClick()}
    >
      <header>{props.scenario.label}</header>
      {props.data.map((compartment, i) => (
        // hide compartment if expandProperties false and index > 4
        // highlight compartment if selectedProperty === compartment
        <ul
          key={compartment.compartment}
          style={{
            display: props.expandProperties || i < 4 ? 'flex' : 'none',
            color: props.selectedProperty === compartment.compartment ? 'inherit' : 'black',
          }}
        >
          <li>{compartment.value}</li>
          <li>{compartment.rate}%</li>
        </ul>
      ))}
    </div>
  );
}

// Scenario Card Section
export default function Scenario(props: {scenarios: Scenario[]}): JSX.Element {
  const {t} = useTranslation();

  const classes = useStyles();
  const dispatch = useAppDispatch();
  const [selectedProperty, setSelectedProperty] = useState('');
  const [activeScenario, setActiveScenario] = useState(0);
  const [expandProperties, setExpandProperties] = useState(false);

  return (
    <div className={classes.root}>
      <div className='scenario-header'>
        <span>{t('today')}</span>
        {properties.map((compartment, i) => (
          <ul
            key={compartment.compartment}
            style={{
              display: expandProperties || i < 4 ? 'flex' : 'none',
              fontWeight: compartment.compartment === selectedProperty ? 'bold' : 'normal',
            }}
            onClick={() => {
              // set selected property and dispatch new compartment and new rate for currently selected scenario
              setSelectedProperty(compartment.compartment);
              dispatch(selectCompartment(compartment.compartment));
              dispatch(selectRate(compartment.scenarios[props.scenarios[activeScenario].id].value)); // TODO: dispatch selectRate passing value not rate?
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
      <div className='scenario-container'>
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
              // if a property has been selected filter properties for selected and dispatch selectRate for that property and the selected scenario
              if (!(selectedProperty === '')) {
                dispatch(
                  selectRate(properties.filter((x) => x.compartment === selectedProperty)[0].scenarios[scn.id].value) // TODO: dispatch selectRate passing value not rate?
                );
              }
            }}
          />
        ))}
      </div>
      <div className='scenario-footer'>
        <button aria-label={t('scenario.add')}>+</button>
      </div>
    </div>
  );
}
