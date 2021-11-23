import React from 'react';
import {createStyles, makeStyles} from '@mui/styles';

/* This component displays the individual scenario cards of the Scenario component
 */

// create css styles
const useStyles = makeStyles(() =>
  createStyles({
    scenario_card: {
      flexGrow: 0,
      flexShrink: 0,
      flexBasis: '160px',
      boxSizing: 'border-box',
      margin: '12px',
      padding: '12px',

      '& header': {
        fontWeight: 'bold',
        lineHeight: '1.5rem',
        minHeight: '3rem',
      },

      '& ul': {
        display: 'flex',
      },

      '& li': {
        listStyleType: 'none',
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: '100%',
      },
    },
  })
);

/**
 * Type definition for the ScenarioCard props
 * @typedef {object} ScenarioCardProps
 *
 * @prop {object}   scenario          - The scenario this card is displaying.
 * @prop {string}   scenario.id    - The identifier for the scenario.
 * @prop {string}   scenario.label - The label for the scenario displayed to the user.
 * @prop {string}   scenario.color - The Hex-color code for the scenario.
 * @prop {number}   key               - The key for this scenario (index from the map function for the scenario list).
 * @prop {boolean}  active            - Boolean value whether the scenario is the selected scenario.
 * @prop {object[]} data              - The list of compartment data for this scenario (see {@link PropertyUpdate}).
 * @prop {string}   data.compartment  - The compartment name.
 * @prop {number}   data.value        - The value for the compartment.
 * @prop {number}   data.rate         - The rate for the compartment.
 * @prop {string}   selectedProperty  - The compartment name of the currently selected compartment, or empty string if none is selected.
 * @prop {boolean}  expandProperties  - Boolean value whether the properties list is expanded or only the first four are shown.
 * @prop {function} onClick           - The function that is executed when the scenario card is clicked.
 *
 * @returns {JSX.Element} JSX Element to render the scenario card.
 */
interface ScenarioCardProps {
  scenario: {
    id: string;
    label: string;
    color: string;
  };
  key: number;
  active: boolean;
  data: {
    compartment: string;
    value: number;
    rate: number;
  }[];
  selectedProperty: string;
  expandProperties: boolean;
  onClick: () => void;
}

/**
 * React Component to render individual Scenario Card
 * @prop {ScenarioCardProps} props - The props for the component.
 * @returns {JSX.Element} JSX Element to render the scenario card.
 */
export default function ScenarioCard(props: ScenarioCardProps): JSX.Element {
  const classes = useStyles();
  return (
    <div
      className={classes.scenario_card}
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
