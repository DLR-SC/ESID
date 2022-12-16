import React, {useEffect, useRef, useState} from 'react';
import {useTheme} from '@mui/material/styles';
import {Box, IconButton, List, ListItem, ListItemText, Tooltip, Typography} from '@mui/material';
import {useAppSelector} from 'store/hooks';
import {useGetSingleSimulationEntryQuery} from 'store/services/scenarioApi';
import {Dictionary} from '../util/util';
import {useTranslation} from 'react-i18next';
import {NumberFormatter} from '../util/hooks';
import {CheckBoxOutlineBlank, CheckBox} from '@mui/icons-material';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';

/**
 * React Component to render individual Scenario Card
 * @prop {ScenarioCardProps} props - The props for the component.
 * @returns {JSX.Element} JSX Element to render the scenario card.
 */
export default function ScenarioCard(props: ScenarioCardProps): JSX.Element {
  const theme = useTheme();
  const {t, i18n} = useTranslation();

  const compartmentsRef = useRef<HTMLUListElement | null>(null);

  const {formatNumber} = NumberFormatter(i18n.language, 3, 8);

  const [compartmentValues, setCompartmentValues] = useState<Dictionary<number> | null>(null);

  const compartments = useAppSelector((state) => state.scenarioList.compartments);
  const node = useAppSelector((state) => state.dataSelection.district?.ags);
  const day = useAppSelector((state) => state.dataSelection.date);
  const {data} = useGetSingleSimulationEntryQuery(
    {
      id: props.scenario.id,
      node: node,
      day: day ?? '',
      groups: ['total'],
    },
    {skip: !day}
  );

  const [hover, setHover] = useState<boolean>(false);

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

  const TrendArrow = (props: {compartment: string}): JSX.Element => {
    const compartment = props.compartment;
    // Shows downwards green arrows if getCompartmentRate < 0%.
    if (parseFloat(getCompartmentRate(compartment)) < 0) {
      return <ArrowDropDownIcon color={'success'} fontSize={'medium'} sx={{display: 'block'}} />;
    }
    // Shows upwards red arrows if getCompartmentRate > 3%. If there is no RKI value for that compartment i.e., getCompartmentRate is Null, then it will check the getCompartmentValue (scenario values only) which will always be positive.
    else if (
      parseFloat(getCompartmentRate(compartment)) > 3 ||
      (parseFloat(getCompartmentValue(compartment)) > 0 && getCompartmentRate(compartment) === 'N/A')
    ) {
      return <ArrowDropUpIcon color={'error'} fontSize={'medium'} sx={{display: 'block'}} />;
    }
    // Shows grey arrows (stagnation) if getCompartmentRate is between 0 and 3 % or if there is no RKI value.
    else {
      return <ArrowRightIcon color={'action'} fontSize={'medium'} sx={{display: 'block'}} />;
    }
  };

  return (
    <Box
      sx={{
        position: 'relative',
        zIndex: 0,
        flexGrow: 0,
        flexShrink: 0,
        flexBasis: '172px',
        boxSizing: 'border-box',
        marginX: '2px',
        marginY: theme.spacing(2),
        mb: 0,
      }}
      onMouseLeave={() => setHover(false)}
    >
      {/*hover-state*/}
      <Box
        sx={{
          position: 'absolute',
          zIndex: -1,
          width: '100%',
          height: '100%',
          borderRadius: '9px', //matching the radius of the box shadow
          background: hexToRGB(props.color, 0.4),
          display: hover ? 'flex' : 'none',
          alignItems: 'flex-end',
        }}
      >
        <Tooltip
          title={props.active ? t('scenario.deactivate').toString() : t('scenario.activate').toString()}
          arrow={true}
        >
          <IconButton
            color={'primary'}
            onClick={() => props.onToggle()}
            aria-label={props.active ? t('scenario.deactivate') : t('scenario.activate')}
          >
            {props.active ? <CheckBox /> : <CheckBoxOutlineBlank />}
          </IconButton>
        </Tooltip>
      </Box>
      <Box
        sx={{
          position: 'relative',
          zIndex: 0,
          boxSizing: 'border-box',
          height: 'min-content',
          padding: theme.spacing(2),
          border: `2px solid ${props.color}`,
          borderRadius: '3px',
          margin: '6px',
          background: theme.palette.background.paper,
          color: props.color,
          boxShadow: props.selected && !hover ? `0px 0px 0px 6px ${hexToRGB(props.color, 0.4)}` : 'none',
          transition: 'transform 0.5s',
          transformStyle: 'preserve-3d',
          transform: !props.active ? 'rotateY(180deg)' : 'none',
        }}
        onClick={props.active ? () => props.onClick() : () => true}
        onMouseEnter={() => setHover(true)}
      >
        {/*back*/}
        <Box
          sx={{
            position: 'absolute',
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-end',
              height: '3rem',
              marginLeft: theme.spacing(2),
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
        </Box>
        {/*front*/}
        <Box
          sx={{
            transform: 'rotateY(0deg)', //firefox ignores backface-visibility if the object is not rotated
            backfaceVisibility: 'hidden',
          }}
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
                  color:
                    props.selectedProperty === compartment ? theme.palette.text.primary : theme.palette.text.disabled,
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
                <TrendArrow compartment={compartment} />
              </ListItem>
            ))}
          </List>
        </Box>
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
  selected: boolean;

  /** Boolean value whether the scenario is active (not flipped). */
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

  /** The function that is executed when the disable toggle is clicked. */
  onToggle: () => void;
}

function hexToRGB(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16),
    g = parseInt(hex.slice(3, 5), 16),
    b = parseInt(hex.slice(5, 7), 16);

  if (alpha) {
    return 'rgba(' + r.toString() + ', ' + g.toString() + ', ' + b.toString() + ', ' + alpha.toString() + ')';
  } else {
    return 'rgb(' + r.toString() + ', ' + g.toString() + ', ' + b.toString() + ')';
  }
}
