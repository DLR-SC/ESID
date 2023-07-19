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

export function DataCard(props: {
  id: number;
  label: string;
  color: string;
  selected: boolean;
  active: boolean;
  compartmentValues: Dictionary<number> | null;
  startValues: Dictionary<number> | null;
  onClick: () => void;
  onToggle: () => void;
}): JSX.Element {
  const theme = useTheme();
  const {t, i18n} = useTranslation();

  const {formatNumber} = NumberFormatter(i18n.language, 1, 0);

  const compartments = useAppSelector((state) => state.scenarioList.compartments);
  const selectedCompartment = useAppSelector((state) => state.dataSelection.compartment);
  const compartmentsExpanded = useAppSelector((state) => state.dataSelection.compartmentsExpanded);

  const [hover, setHover] = useState<boolean>(false);

  const getCompartmentValue = (compartment: string): string => {
    if (props.compartmentValues && compartment in props.compartmentValues) {
      return formatNumber(props.compartmentValues[compartment]);
    }
    return t('no-data');
  };

  const getCompartmentRate = (compartment: string): string => {
    if (
      props.compartmentValues &&
      compartment in props.compartmentValues &&
      props.startValues &&
      compartment in props.startValues
    ) {
      const value = props.compartmentValues[compartment];
      const startValue = props.startValues[compartment];
      const result = Math.round(100 * (value / startValue) - 100);
      if (isFinite(result)) {
        let sign: string;
        if (result > 0) {
          sign = result === 0 ? '\u00B1' : '+';
        } else {
          sign = result === 0 ? '\u00B1' : '-';
        }
        return sign + Math.abs(result).toFixed() + '%';
      }
    }

    // Return a Figure Dash (‒) where a rate cannot be calculated.
    return '\u2012';
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
            id={`scenario-card-back-${props.id}`}
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
                {props.label}
              </Typography>
            </Box>
          </Box>
          <Box
            id={`scenario-card-front-${props.id}`}
            sx={{
              transform: 'rotateY(0deg)', //firefox ignores backface-visibility if the object is not rotated
              backfaceVisibility: 'hidden',
              margin: '6px',
            }}
          >
            <Box
              id={`scenario-card-title-container-${props.id}`}
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
                {props.label}
              </Typography>
            </Box>
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
                    <TrendArrow
                      rate={getCompartmentRate(compartment)}
                      value={parseFloat(getCompartmentValue(compartment))}
                    />
                  </ListItem>
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

function TrendArrow(props: {rate: string; value: number}): JSX.Element {
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