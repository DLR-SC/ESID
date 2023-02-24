import React, {useEffect, useState} from 'react';
import {useTheme} from '@mui/material/styles';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import {useAppSelector} from 'store/hooks';
import {useGetSingleSimulationEntryQuery} from 'store/services/scenarioApi';
import {Dictionary} from '../util/util';
import {useTranslation} from 'react-i18next';
import {NumberFormatter} from '../util/hooks';
import CheckBoxOutlineBlank from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBox from '@mui/icons-material/CheckBox';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import {ScrollSyncPane} from 'react-scroll-sync';
import Button from '@mui/material/Button';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';
import Collapse from '@mui/material/Collapse';
import {GroupFilterCard} from './GroupFilterCard';

/**
 * React Component to render individual Scenario Card
 * @prop {ScenarioCardProps} props - The props for the component.
 * @returns {JSX.Element} JSX Element to render the scenario card.
 */
export default function ScenarioCard(props: ScenarioCardProps): JSX.Element {
  const theme = useTheme();
  const {t, i18n} = useTranslation();

  const {formatNumber} = NumberFormatter(i18n.language, 1, 0);

  const [compartmentValues, setCompartmentValues] = useState<Dictionary<number> | null>(null);

  const compartments = useAppSelector((state) => state.scenarioList.compartments);
  const selectedCompartment = useAppSelector((state) => state.dataSelection.compartment);
  const compartmentsExpanded = useAppSelector((state) => state.dataSelection.compartmentsExpanded);
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

    // Return a Figure Dash (‒) where a rate cannot be calculated.
    return '\u2012';
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
      (parseFloat(getCompartmentValue(compartment)) > 0 && getCompartmentRate(compartment) === '\u2012')
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
      id={`scenario-card-root-${props.scenario.id}`}
      sx={{
        display: 'flex',
        flexDirection: 'row',
        color: props.color,
        width: 'min-content',
        paddingLeft: theme.spacing(3),
        paddingRight: theme.spacing(3),
      }}
    >
      <Box
        sx={{
          position: 'relative',
          zIndex: 0,
          flexGrow: 0,
          flexShrink: 0,
          width: '200px',
          boxSizing: 'border-box',
          marginX: '2px',
          marginY: theme.spacing(2),
          marginBottom: 0,
        }}
        onMouseLeave={() => setHover(false)}
      >
        {/*hover-state*/}
        <Box
          id={`scenario-card-settings-list-${props.scenario.id}`}
          sx={{
            position: 'absolute',
            zIndex: -2,
            width: 'calc(100% + 12px)',
            height: '100%',
            marginTop: '-6px',
            marginLeft: '-6px',
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
          id={`scenario-card-main-card-${props.scenario.id}`}
          sx={{
            position: 'relative',
            zIndex: 0,
            boxSizing: 'border-box',
            height: 'min-content',
            padding: theme.spacing(2),
            border: `2px solid ${props.color}`,
            borderRadius: '3px',
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
          <Box
            id={`scenario-card-back-${props.scenario.id}`}
            sx={{
              position: 'absolute',
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              margin: '6px',
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
          <Box
            id={`scenario-card-front-${props.scenario.id}`}
            sx={{
              transform: 'rotateY(0deg)', //firefox ignores backface-visibility if the object is not rotated
              backfaceVisibility: 'hidden',
              margin: '6px',
            }}
          >
            <Box
              id={`scenario-card-title-container-${props.scenario.id}`}
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
            <ScrollSyncPane group='compartments'>
              <List
                id={`scenario-card-compartment-list-${props.scenario.id}`}
                className='hide-scrollbar'
                dense={true}
                disablePadding={true}
                sx={{
                  maxHeight: compartmentsExpanded ? '248px' : 'auto',
                  overflowX: 'hidden',
                  overflowY: 'auto',
                }}
              >
                {compartments.map((compartment, i) => (
                  <ListItem
                    key={compartment}
                    sx={{
                      // hide compartment if compartmentsExpanded false and index > 4
                      // highlight compartment if selectedCompartment === compartment
                      display: compartmentsExpanded || i < 4 ? 'flex' : 'none',
                      color:
                        selectedCompartment === compartment ? theme.palette.text.primary : theme.palette.text.disabled,
                      padding: theme.spacing(1),
                      margin: theme.spacing(0),
                      marginTop: theme.spacing(1),
                      borderTop: '2px solid transparent',
                      borderBottom: '2px solid transparent',
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
            </ScrollSyncPane>
          </Box>
        </Box>
      </Box>
      {props.active ? <GroupFilterAppendage scenarioId={props.scenario.id} color={props.color} /> : null}
    </Box>
  );
}

/**
 * This component is placed on the right side of the scenario cards, if at least one group filter is active. It contains
 * a button to open and close the card appendage for the active group filters.
 */
function GroupFilterAppendage(props: GroupFilterAppendageProps): JSX.Element | null {
  const theme = useTheme();
  const groupFilterList = useAppSelector((state) => state.dataSelection.groupFilters);

  const [folded, setFolded] = useState(true);

  if (!groupFilterList) {
    return null;
  }

  const groupFilterArray = Object.values(groupFilterList);

  // If no group filter is visible this will be hidden.
  if (!groupFilterArray.some((groupFilter) => groupFilter.isVisible)) {
    return null;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        marginY: theme.spacing(2),
        marginLeft: '-3px',
        padding: '1px',
        height: 'min-content',
        border: `1px solid ${props.color}`,
        borderRadius: '3px',
        background: theme.palette.background.paper,
      }}
    >
      <Button
        sx={{
          width: '26px',
          minWidth: '26px',
          borderRight: `1px solid ${theme.palette.divider}`,
        }}
        onClick={() => setFolded(!folded)}
      >
        {folded ? <ChevronLeft /> : <ChevronRight />}
      </Button>
      <Collapse in={folded} orientation='horizontal'>
        <Box
          id={`scenario-card-${props.scenarioId}-group-filter-list`}
          sx={{
            display: 'flex',
            flexDirection: 'row',
          }}
        >
          {groupFilterArray
            .filter((groupFilter) => groupFilter.isVisible)
            .map((groupFilter, i) => {
              return (
                <GroupFilterCard
                  key={groupFilter.name}
                  groupFilter={groupFilter}
                  groupFilterIndex={i}
                  scenarioId={props.scenarioId}
                />
              );
            })}
        </Box>
      </Collapse>
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

  startValues: Dictionary<number> | null;

  /** The function that is executed when the scenario card is clicked. */
  onClick: () => void;

  /** The function that is executed when the disable toggle is clicked. */
  onToggle: () => void;
}

interface GroupFilterAppendageProps {
  /** The scenario id. */
  scenarioId: number;

  /** The scenario color. */
  color: string;
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
