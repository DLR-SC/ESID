import React, {useEffect} from 'react';
import {useTheme} from '@mui/material/styles';
import {Box, List, ListItem, ListItemText, Typography} from '@mui/material';
import {useAppSelector} from 'store/hooks';
import {useGetSingleSimulationEntryQuery} from 'store/services/scenarioApi';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';

/**
 * React Component to render individual Scenario Card
 * @prop {ScenarioCardProps} props - The props for the component.
 * @returns {JSX.Element} JSX Element to render the scenario card.
 */
export default function ScenarioCard(props: ScenarioCardProps): JSX.Element {
  const theme = useTheme();
  const {i18n} = useTranslation();

  const [numberFormat] = useState(
    new Intl.NumberFormat(i18n.language, {
      minimumSignificantDigits: 1,
      maximumSignificantDigits: 3,
    })
  );

  const [compartmentValues, setCompartmentValues] = useState<{[key: string]: string | number; day: string} | null>(
    null
  );

  const compartments = useAppSelector((state) => state.scenarioList.compartments);
  const node = useAppSelector((state) => state.dataSelection.district.ags);
  const day = useAppSelector((state) => state.dataSelection.date);
  const {data} = useGetSingleSimulationEntryQuery({id: props.scenario.id, node, day, group: 'total'});

  useEffect(() => {
    if (data) {
      setCompartmentValues(data.results[0]);
    }
  }, [data]);

  const getCompartmentValue = (compartment: string): string => {
    if (compartmentValues && compartment in compartmentValues) {
      const value = compartmentValues[compartment];
      if (typeof value === 'number') {
        return numberFormat.format(value);
      }
    }

    return 'No Data';
  };

  const getCompartmentRate = (compartment: string): string => {
    if (
      compartmentValues &&
      compartment in compartmentValues &&
      props.startValues &&
      compartment in props.startValues
    ) {
      const value = compartmentValues[compartment];
      const startValue = props.startValues[compartment];
      if (typeof value === 'number' && typeof startValue === 'number') {
        const result = 100 * (value / startValue);
        if (isFinite(result)) {
          return result.toFixed() + '%';
        }
      }
    }

    return 'N/A';
  };

  return (
    <Box
      sx={{
        flexGrow: 0,
        flexShrink: 0,
        flexBasis: '160px',
        boxSizing: 'border-box',
        height: 'min-content',
        margin: theme.spacing(3),
        padding: theme.spacing(2),
        border: `2px solid ${props.color}`,
        borderRadius: '3px',
        background: theme.palette.background.paper,
        color: props.color,
        boxShadow: props.active ? '0px 0px 8px 3px' : 'none',
      }}
      onClick={() => props.onClick()}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-end',
          height: '3rem',
          marginBottom: theme.spacing(2),
        }}
      >
        <Typography
          variant='h2'
          sx={{
            height: 'min-content',
            fontWeight: 'bold',
            fontSize: '13pt',
          }}
        >
          {props.scenario.label}
        </Typography>
      </Box>
      <List dense={true} disablePadding={true}>
        {compartments.map((compartment, i) => (
          // hide compartment if expandProperties false and index > 4
          // highlight compartment if selectedProperty === compartment
          <ListItem
            key={compartment}
            sx={{
              display: props.expandProperties || i < 4 ? 'flex' : 'none',
              color: props.selectedProperty === compartment ? theme.palette.text.primary : theme.palette.text.disabled,
              padding: theme.spacing(1),
              margin: theme.spacing(0),
              marginTop: theme.spacing(1),
            }}
          >
            <ListItemText
              primary={getCompartmentValue(compartment)}
              // disable child typography overriding this
              disableTypography={true}
              sx={{
                typography: 'listElement',
                textAlign: 'right',
                flexBasis: '61.8%',
              }}
            />
            <ListItemText
              primary={getCompartmentRate(compartment)}
              // disable child typography overriding this
              disableTypography={true}
              sx={{
                typography: 'listElement',
                fontWeight: 'bold',
                textAlign: 'right',
                flexBasis: '38.2%',
              }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

/** Type definition for the ScenarioCard props */
interface ScenarioCardProps {
  /** The scenario this card is displaying. */
  scenario: {
    /** The identifier for the scenario. */
    id: number;

    /** The label for the scenario displayed to the user. */
    label: string;
  };

  /** The key for this scenario (index from the map function for the scenario list). */
  key: number;

  /** Boolean value whether the scenario is the selected scenario. */
  active: boolean;

  /** The color of the card. */
  color: string;

  /** The compartment name of the currently selected compartment, or empty string if none is selected. */
  selectedProperty: string;

  /** Boolean value whether the properties list is expanded or only the first four are shown. */
  expandProperties: boolean;

  startValues: {[key: string]: string | number; day: string} | null;

  /** The function that is executed when the scenario card is clicked. */
  onClick: () => void;
}
