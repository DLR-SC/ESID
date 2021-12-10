import React from 'react';
import {useTheme} from '@mui/material/styles';
import {Box, List, ListItem, ListItemText, Typography} from '@mui/material';

/* This component displays the individual scenario cards of the Scenario component
 */

/** Type definition for the ScenarioCard props */
interface ScenarioCardProps {
  /** The scenario this card is displaying. */
  scenario: {
    /** The identifier for the scenario. */
    id: string;

    /** The label for the scenario displayed to the user. */
    label: string;

    /** The Hex-color code for the scenario. */
    color: string;
  };

  /** The key for this scenario (index from the map function for the scenario list). */
  key: number;

  /** Boolean value whether the scenario is the selected scenario. */
  active: boolean;

  /** The list of compartment data for this scenario (see {@link PropertyUpdate}. */
  data: {
    /** The compartment name. */
    compartment: string;

    /** The value for the compartment. */
    value: number;

    /** The rate for the compartment. */
    rate: number;
  }[];

  /** The compartment name of the currently selected compartment, or empty string if none is selected. */
  selectedProperty: string;

  /** Boolean value whether the properties list is expanded or only the first four are shown. */
  expandProperties: boolean;

  /** The function that is executed when the scenario card is clicked. */
  onClick: () => void;
}

/**
 * React Component to render individual Scenario Card
 * @prop {ScenarioCardProps} props - The props for the component.
 * @returns {JSX.Element} JSX Element to render the scenario card.
 */
export default function ScenarioCard(props: ScenarioCardProps): JSX.Element {
  const theme = useTheme();

  return (
    <Box
      sx={{
        flexGrow: 0,
        flexShrink: 0,
        flexBasis: '160px',
        boxSizing: 'border-box',
        height: 'auto',
        margin: theme.spacing(3),
        padding: theme.spacing(3),
        border: `2px solid ${props.scenario.color}`,
        background: theme.palette.background.paper,
        color: props.scenario.color,
        boxShadow: props.active ? '0px 0px 12px 3px' : 'none',
      }}
      onClick={() => props.onClick()}
    >
      <Typography
        variant='h1'
        sx={{
          minHeight: '3rem',
          marginBottom: theme.spacing(3),
        }}
      >
        {props.scenario.label}
      </Typography>
      <List dense={true} disablePadding={true}>
        {props.data.map((compartment, i) => (
          // hide compartment if expandProperties false and index > 4
          // highlight compartment if selectedProperty === compartment
          <ListItem
            key={compartment.compartment}
            sx={{
              display: props.expandProperties || i < 4 ? 'flex' : 'none',
              color: props.selectedProperty === compartment.compartment ? 'inherit' : 'black',
              padding: theme.spacing(1),
              margin: theme.spacing(0),
            }}
          >
            <ListItemText
              primary={compartment.value}
              sx={{
                paddingLeft: theme.spacing(2),
              }}
            />
            <ListItemText
              primary={`${compartment.rate} %`}
              sx={{
                textAlign: 'right',
                paddingRight: theme.spacing(2),
              }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
