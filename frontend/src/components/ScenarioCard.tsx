import React, {useEffect, useRef, useState} from 'react';
import {useTheme} from '@mui/material/styles';
import {Box, IconButton, List, ListItem, ListItemText, Tooltip, Typography} from '@mui/material';
import {useAppSelector} from 'store/hooks';
import {useGetSingleSimulationEntryQuery} from 'store/services/scenarioApi';
import {Dictionary} from '../util/util';
import {useTranslation} from 'react-i18next';
import {NumberFormatter} from '../util/hooks';
import {CheckBoxOutlineBlank, CheckBox} from '@mui/icons-material';
import {groupData} from '../types/group';

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
  const filterList = useAppSelector((state) => state.dataSelection.filter);
  const filterData = useAppSelector((state) => state.dataSelection.filterData);

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

  const [folded, fold] = useState(true);

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

  const getIndexByDay = (filter: groupData[]): number => {
    for (let i = 0; i < filter.length; i++) {
      if (filter[i].day == day) {
        return i;
      }
    }
    return 0;
  };

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

  const filterCompartmentValues = (filterName: string, dateIndex: number): JSX.Element | null => {
    if (filterData) {
      return (
        <List
          ref={compartmentsRef}
          dense={true}
          disablePadding={true}
          sx={{
            maxHeight: props.expandProperties ? '248px' : 'auto',
            overflowY: 'hidden',
            width: 'fit-content',
            alignContent: 'right',
            padding: theme.spacing(1),
            margin: theme.spacing(0),
            marginTop: theme.spacing(1),
          }}
        >
          {Object.keys(filterData[filterName][dateIndex].compartments).map((compartment, i) => {
            return (
              // hide compartment if expandProperties false and index > 4
              // highlight compartment if selectedProperty === compartment
              <ListItem
                key={compartment}
                sx={{
                  display: props.expandProperties || i < 4 ? 'flex' : 'none',
                  color:
                    props.selectedProperty === compartment ? theme.palette.text.primary : theme.palette.text.disabled,
                  alignContent: 'center',
                  padding: '4px',
                  margin: '0px',
                  marginTop: '4px',
                  marginRight: '1rem',
                }}
              >
                <ListItemText
                  primary={formatNumber(filterData[filterName][dateIndex].compartments[compartment])}
                  // disable child typography overriding this
                  disableTypography={true}
                  sx={{
                    typography: 'listElement',
                    alignContent: 'center',
                    flexBasis: '55%',
                  }}
                />
              </ListItem>
            );
          })}
        </List>
      );
    } else {
      return null;
    }
  };

  const FilterInfo = (): JSX.Element | null => {
    if (filterList && filterList.length >= 1 && filterData && filterList[0].name) {
      const dateIndex = getIndexByDay(filterData[filterList[0].name]);
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
          }}
        >
          {Object.keys(filterData).map((filterName, i) => {
            return (
              <Box
                key={filterName}
                sx={{
                  marginLeft: i == 0 ? '2.3rem' : '0rem',
                  paddingTop: '1.6rem',
                  marginTop: '0rem',
                  alignContent: 'center',
                  borderLeft: i == 0 ? null : `1px solid`,
                  borderColor: i == 0 ? null : 'divider',
                  paddingLeft: '1.5rem',
                  marginRight: i == Object.keys(filterData).length - 1 ? '0rem' : '1rem',
                }}
              >
                <Typography
                  variant='h3'
                  sx={{
                    height: 'min-content',
                    fontWeight: 'bold',
                    fontSize: '13pt',
                    marginRight: '1rem',
                  }}
                >
                  {filterName}
                </Typography>
                {filterCompartmentValues(filterName, dateIndex)}
              </Box>
            );
          })}
        </Box>
      );
    } else {
      return null;
    }
  };

  const activateFilters = (): JSX.Element | null => {
    if (filterList && filterList.length >= 1) {
      for (let i = 0; i < filterList.length; i++) {
        if (filterList[i].toggle) {
          return (
            <Box
              sx={{
                display: props.active ? 'inline-flex' : 'none',
                marginLeft: '-2rem',
                marginTop: '1rem',
                border: `2px solid ${props.color}`,
                width: folded ? '3rem' : 'fit-content',
                height: '12.6rem',
                borderRadius: '10px',
                background: folded ? props.color : theme.palette.background.paper,
                flexDirection: 'row',
              }}
              onClick={() => fold(!folded)}
            >
              {!folded ? FilterInfo() : ''}
            </Box>
          );
        }
      }
      return null;
    } else {
      return null;
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        color: props.color,
      }}
    >
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
            zIndex: -2,
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
                </ListItem>
              ))}
            </List>
          </Box>
        </Box>
      </Box>

      {activateFilters()}
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
