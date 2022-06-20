import React, { useEffect, useRef } from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, List, ListItem, ListItemText, Typography } from '@mui/material';
import { useAppSelector } from 'store/hooks';
import { useGetSingleSimulationEntryQuery } from 'store/services/scenarioApi';
import { useState } from 'react';
import { Dictionary } from '../util/util';
import { useTranslation } from 'react-i18next';
import { NumberFormatter } from '../util/hooks';

/**
 * React Component to render individual Scenario Card
 * @prop {ScenarioCardProps} props - The props for the component.
 * @returns {JSX.Element} JSX Element to render the scenario card.
 */
export default function ScenarioCard(props: ScenarioCardProps): JSX.Element {
  const theme = useTheme();
  const { t, i18n } = useTranslation();

  const compartmentsRef = useRef<HTMLUListElement | null>(null);

  const { formatNumber } = NumberFormatter(i18n.language, 3, 8);

  const [compartmentValues, setCompartmentValues] = useState<Dictionary<number> | null>(null);


  const compartments = useAppSelector((state) => state.scenarioList.compartments);
  const node = useAppSelector((state) => state.dataSelection.district?.ags);
  const day = useAppSelector((state) => state.dataSelection.date);
  const { data } = useGetSingleSimulationEntryQuery(
    { id: props.scenario.id, node: node, day: day ?? '', group: 'total' },
    { skip: !day }
  );

  const [folded, fold] = React.useState(true);
  const [backgroundColor, setColor] = React.useState(props.color);
  const [groupInfoWidth, setGroupInfoWidth] = React.useState("3rem");
  const [groupInfoHeight, setGroupInfoHeight] = React.useState("11rem");

  useEffect(() => {
    if (compartmentsRef.current) {
      if (props.expandProperties) {
        compartmentsRef.current.scrollTop = props.scrollTop;
      } else {
        compartmentsRef.current.scrollTop = 0;
      }
    }
  }, [props.expandProperties, props.scrollTop]);

  useEffect(() => {
    if (data && data.results.length > 0) {
      setCompartmentValues(data.results[0].compartments);
    }
  }, [data]);

  useEffect(() => {
    if (folded == true) {
      setColor(props.color);
      setGroupInfoWidth("3rem");
      setGroupInfoHeight("11rem");
    } else {
      setColor(theme.palette.background.paper);
      setGroupInfoWidth("10rem");
      setGroupInfoHeight("min-content");
    }
  }, [folded, props.color, theme.palette.background.paper])





  const getCompartmentValue = (compartment: string): string => {
    if (compartmentValues && compartment in compartmentValues) {
      return formatNumber(compartmentValues[compartment]);
    }
    return t('no-data');
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
      const result = Math.round(100 * (value / startValue) - 100);
      if (isFinite(result)) {
        const sign = result === 0 ? '\u00B1' : result > 0 ? '+' : '-';
        return sign + Math.abs(result).toFixed() + '%';
      }
    }

    return 'N/A';
  };



  const groupInfo = (): JSX.Element => {
    if (folded == false) {
      return (<List
        ref={compartmentsRef}
        dense={true}
        disablePadding={true}
        sx={{
          maxHeight: props.expandProperties ? '248px' : 'auto',
          overflowY: 'hidden',
        }}
      >
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
                flexBasis: '55%',
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
                flexBasis: '45%',
              }}
            />
          </ListItem>
        ))}
      </List>);
    } else {
      return (<Box></Box>);
    }
  }



  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        alignSelf: "center",
        justifyContent: "center",
        alignItems: "center",
        marginRight: "-2rem",
      }}
    >

      <Box
        sx={{
          flexGrow: 0,
          flexShrink: 0,
          flexBasis: '160px',
          boxSizing: 'border-box',
          height: 'min-content',
          margin: theme.spacing(3),
          marginRight: "-1rem",
          padding: theme.spacing(2),
          paddingRight: "-1rem",
          border: `2px solid ${props.color}`,
          borderRadius: '3px',
          background: theme.palette.background.paper,
          color: props.color,
          boxShadow: props.active ? '0px 0px 8px 3px' : 'none',
          zIndex: "2",
        }}
        onClick={() => props.onClick()}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-end',
            height: '3rem',
            marginBottom: theme.spacing(1),
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
        <List
          ref={compartmentsRef}
          dense={true}
          disablePadding={true}
          sx={{
            maxHeight: props.expandProperties ? '248px' : 'auto',
            overflowY: 'hidden',
          }}
        >
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
                  flexBasis: '55%',
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
                  flexBasis: '45%',
                }}
              />
            </ListItem>
          ))}
        </List>
      </Box>
      <Box
        sx={{
          marginLeft: "-1rem",
          border: `2px solid ${props.color}`,
          zIndex: "1",
          width: groupInfoWidth,
          height: groupInfoHeight,
          borderRadius: "10px",
          background: backgroundColor,
        }}
        onClick={() => fold(!folded)}
      >
        {groupInfo()}
      </Box>
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

  /** To synchronize scrolling. */
  scrollTop: number;

  startValues: Dictionary<number> | null;

  /** The function that is executed when the scenario card is clicked. */
  onClick: () => void;
}
