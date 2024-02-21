// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {Dictionary} from '../../util/util';
import {useTheme} from '@mui/material/styles';
import {useTranslation} from 'react-i18next';
import {NumberFormatter} from '../../util/hooks';
import {useAppSelector} from '../../store/hooks';
import React, {useState} from 'react';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import CheckBox from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlank from '@mui/icons-material/CheckBoxOutlineBlank';
import Typography from '@mui/material/Typography';
import {ScrollSyncPane} from 'react-scroll-sync';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import {GroupFilterAppendage} from './GroupFilterAppendage';

interface DataCardProps {
  /** The scenario id of the card. Note that id 0 is reserved for case data. */
  id: number;

  /** This is the title of the card. */
  label: string;

  /** The color of the scenario that the card should be highlighted in. */
  color: string;

  /** If the card is the selected one. Only one card can be selected at the same time. */
  selected: boolean;

  /** If this card is active. If not the card is flipped and only the title is shown. */
  active: boolean;

  /** All the values that correspond to this card. */
  compartmentValues: Dictionary<number> | null;

  /** The simulation start values. They are used for calculating the rate. */
  startValues: Dictionary<number> | null;

  /** Callback for when the card is selected. */
  onClick: () => void;

  /** Callback for when the card is activated or deactivated. */
  onToggle: () => void;
}

/**
 * This component renders a card for either the case data card or the scenario cards. It contains a title and a list of
 * compartment values and change rates relative to the simulation start.
 */
export function DataCard(props: DataCardProps): JSX.Element {
  const theme = useTheme();
  const {t, i18n} = useTranslation();

  const {formatNumber} = NumberFormatter(i18n.language, 1, 0);

  const compartments = useAppSelector((state) => state.scenarioList.compartments);
  const compartmentsExpanded = useAppSelector((state) => state.dataSelection.compartmentsExpanded);

  const [hover, setHover] = useState<boolean>(false);

  /** This function either returns the value at simulation start of a compartment or 'no data'. */
  const getCompartmentValue = (compartment: string): string => {
    if (props.compartmentValues && compartment in props.compartmentValues) {
      return formatNumber(props.compartmentValues[compartment]);
    }
    return t('no-data');
  };

  /**
   * This function returns one of the following things:
   *  - The relative increase of a compartment value preceded by a plus sign
   *  - The relative decrease of a compartment value preceded by a minus sign
   *  - A zero preceded by a plus-minus sign
   *  - A dash, when no rate of change can be calculated
   */
  const getCompartmentRate = (compartment: string): string => {
    if (
      !props.compartmentValues ||
      !(compartment in props.compartmentValues) ||
      !props.startValues ||
      !(compartment in props.startValues)
    ) {
      // Return a Figure Dash (‒) where a rate cannot be calculated.
      return '\u2012';
    }

    const value = props.compartmentValues[compartment];
    const startValue = props.startValues[compartment];
    const result = Math.round(100 * (value / startValue) - 100);

    if (!isFinite(result)) {
      // Return a Figure Dash (‒) where a rate cannot be calculated.
      return '\u2012';
    }

    let sign: string;
    if (result > 0) {
      sign = '+';
    } else if (result < 0) {
      sign = '-';
    } else {
      // Return a Plus Minus sign (±) where a rate cannot be calculated.
      sign = '\u00B1';
    }

    return sign + Math.abs(result).toFixed() + '%';
  };

  return (
    <Box
      id={`scenario-card-root-${props.id}`}
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
        id='scenario-card-container'
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
          id={`scenario-card-settings-list-${props.id}`}
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
          id={`scenario-card-main-card-${props.id}`}
          sx={{
            position: 'relative',
            zIndex: 0,
            boxSizing: 'border-box',
            height: 'min-content',
            paddingTop: theme.spacing(2),
            paddingBottom: theme.spacing(2),
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
            id={`scenario-card-back-${props.id}`}
            sx={{
              position: 'absolute',
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              margin: '6px',
            }}
          >
            <CardTitle title={props.label} id={props.id} isFront={false} />
          </Box>
          <Box
            id={`scenario-card-front-${props.id}`}
            sx={{
              transform: 'rotateY(0deg)', //firefox ignores backface-visibility if the object is not rotated
              backfaceVisibility: 'hidden',
              marginTop: '6px',
              marginBottom: '6px',
            }}
          >
            <CardTitle title={props.label} id={props.id} isFront />
            <ScrollSyncPane group='compartments'>
              <List
                id={`scenario-card-compartment-list-${props.id}`}
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
                  <CompartmentRow
                    key={compartment}
                    compartment={compartment}
                    value={getCompartmentValue(compartment)}
                    rate={getCompartmentRate(compartment)}
                    color={props.color}
                    index={i}
                  />
                ))}
              </List>
            </ScrollSyncPane>
          </Box>
        </Box>
      </Box>
      {props.active ? <GroupFilterAppendage scenarioId={props.id} color={props.color} /> : null}
    </Box>
  );
}

interface CardTitleProps {
  /** The id of the card. Either zero for the case data or the scenario id. */
  id: number;

  /** The title of the card. */
  title: string;

  /** If the card is front facing or flipped. */
  isFront: boolean;
}

/** Renders the card title. Depending, if the card is flipped or not the title will be left or right aligned. */
function CardTitle(props: CardTitleProps): JSX.Element {
  const theme = useTheme();

  return (
    <Box
      id={`scenario-card-title-container-${props.id}-${props.isFront ? 'front' : 'back'}`}
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
          paddingLeft: theme.spacing(3),
          paddingRight: theme.spacing(3),
        }}
      >
        {props.title}
      </Typography>
    </Box>
  );
}

interface CompartmentRowProps {
  /** The name of the compartment. */
  compartment: string;

  /** The compartment value to display. */
  value: string;

  /** The rate of change to display. */
  rate: string;

  /** The corresponding scenario color. */
  color: string;

  /** The index of the compartment. */
  index: number;
}

/**
 * This component renders a single row of the data card. To the left the value will be displayed and to the right the
 * rate is displayed. If the index of the compartment is greater than three and the compartment list is not in the
 * expanded mode this component will be hidden.
 */
function CompartmentRow(props: CompartmentRowProps): JSX.Element {
  const theme = useTheme();

  const selectedCompartment = useAppSelector((state) => state.dataSelection.compartment);
  const compartmentsExpanded = useAppSelector((state) => state.dataSelection.compartmentsExpanded);

  return (
    <ListItem
      sx={{
        // hide compartment if compartmentsExpanded false and index > 4
        // highlight compartment if selectedCompartment === compartment
        display: compartmentsExpanded || props.index < 4 ? 'flex' : 'none',
        color: selectedCompartment === props.compartment ? theme.palette.text.primary : theme.palette.text.disabled,
        backgroundColor: selectedCompartment === props.compartment ? hexToRGB(props.color, 0.1) : 'transparent',
        padding: theme.spacing(1),
        margin: theme.spacing(0),
        marginTop: theme.spacing(1),
        paddingLeft: theme.spacing(3),
        paddingRight: theme.spacing(3),
        borderTop: '2px solid transparent',
        borderBottom: '2px solid transparent',
      }}
    >
      <ListItemText
        primary={props.value}
        // disable child typography overriding this
        disableTypography={true}
        sx={{
          typography: 'listElement',
          textAlign: 'right',
          flexBasis: '55%',
        }}
      />
      <ListItemText
        primary={props.rate}
        // disable child typography overriding this
        disableTypography={true}
        sx={{
          typography: 'listElement',
          fontWeight: 'bold',
          textAlign: 'right',
          flexBasis: '45%',
        }}
      />
      <TrendArrow rate={props.rate} value={parseFloat(props.value)} />
    </ListItem>
  );
}

interface TrendArrowProps {
  /** The value. */
  value: number;

  /** The rate of change relative to scenario start. */
  rate: string;
}

/**
 * Renders an arrow depending on value and rate. When the rate is negative a green downwards arrow is rendered, when the
 * rate is between zero and three percent a grey sidewards arrow is rendered and when the rate is greater than three
 * percent a red upwards arrow is being rendered.
 */
function TrendArrow(props: TrendArrowProps): JSX.Element {
  // Shows downwards green arrows if getCompartmentRate < 0%.
  if (parseFloat(props.rate) < 0) {
    return <ArrowDropDownIcon color={'success'} fontSize={'medium'} sx={{display: 'block'}} />;
  }
  // Shows upwards red arrows if getCompartmentRate > 3%. If there is no RKI value for that compartment i.e., getCompartmentRate is Null, then it will check the getCompartmentValue (scenario values only) which will always be positive.
  else if (parseFloat(props.rate) > 3 || (props.value > 0 && props.rate === '\u2012')) {
    return <ArrowDropUpIcon color={'error'} fontSize={'medium'} sx={{display: 'block'}} />;
  }
  // Shows grey arrows (stagnation) if getCompartmentRate is between 0 and 3 % or if there is no RKI value.
  else {
    return <ArrowRightIcon color={'action'} fontSize={'medium'} sx={{display: 'block'}} />;
  }
}

/** Takes a three component hex string and an alpha value and transforms it into an rgba css string. */
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
