// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import Box from '@mui/material/Box';
import {ScrollSyncPane} from 'react-scroll-sync';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import {selectCompartment, setStartDate, toggleCompartmentExpansion} from '../../store/DataSelectionSlice';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import React, {MouseEvent, useEffect, useMemo, useState} from 'react';
import {darken, useTheme} from '@mui/material/styles';
import {useTranslation} from 'react-i18next';
import {useAppDispatch, useAppSelector} from '../../store/hooks';
import {NumberFormatter} from '../../util/hooks';
import {useGetSimulationStartValues} from './hooks';
import ListItemIcon from '@mui/material/ListItemIcon';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import Tooltip from '@mui/material/Tooltip';
import {DatePicker} from '@mui/x-date-pickers/DatePicker';
import dayjs, {Dayjs} from 'dayjs';
import {dateToISOString} from '../../util/util';
import {setReferenceDayTop} from '../../store/LayoutSlice';
import {useBoundingclientrectRef} from 'rooks';

/**
 * The component renders a list of compartments with their name on the left and the case data values at simulation start
 * at the right. The user can select a compartment by clicking on one in the list. The list shows by default four
 * compartments, but can be expanded by clicking on the more button. The extended list can be scrolled and is
 * synchronized with the compartment lists of the data cards to the right.
 */
export default function CompartmentList(): JSX.Element {
  const theme = useTheme();
  const {t, i18n} = useTranslation();
  const dispatch = useAppDispatch();
  const {formatNumber} = NumberFormatter(i18n.language, 1, 0);

  const compartments = useAppSelector((state) => state.scenarioList.compartments);
  const selectedCompartment = useAppSelector((state) => state.dataSelection.compartment);
  const compartmentsExpanded = useAppSelector((state) => state.dataSelection.compartmentsExpanded);
  const compartmentValues = useGetSimulationStartValues();

  const [resizeRef, resizeBoundingRect] = useBoundingclientrectRef();

  useEffect(() => {
    const x = resizeBoundingRect?.x ?? 0;
    const w = resizeBoundingRect?.width ?? 0;
    dispatch(setReferenceDayTop(x + w));
  }, [dispatch, resizeBoundingRect]);

  /** This function either returns the value at simulation start of a compartment or 'no data'. */
  const getCompartmentValue = (compartment: string): string => {
    if (compartmentValues && compartment in compartmentValues) {
      return formatNumber(compartmentValues[compartment]);
    }
    return t('no-data');
  };

  // This effect sets the selected compartment to the first one if no compartment is initially selected.
  useEffect(() => {
    if (!selectedCompartment && compartments.length > 0) {
      dispatch(selectCompartment(compartments[0]));
    }
  }, [dispatch, compartments, selectedCompartment]);

  return (
    <Box
      id='scenario-view-compartment-list-root'
      ref={resizeRef}
      sx={{
        borderRight: `2px dashed ${darken(theme.palette.divider, 0.25)}`,
        flexGrow: 0,
        flexShrink: 0,
        flexBasis: '274px',
        minHeight: '20vh',
        maxWidth: '100%',
        display: 'flex',
        flexDirection: 'column',
        marginTop: theme.spacing(3),
        borderTop: '2px solid transparent', // invisible border for alignment with the scenario card
        paddingBottom: 0,
        paddingTop: theme.spacing(2),
        paddingLeft: 0,
        paddingRight: 0,
      }}
    >
      <SimulationStartTitle />
      <ScrollSyncPane group='compartments'>
        <List
          id='scenario-view-compartment-list'
          dense={true}
          disablePadding={true}
          sx={{
            maxHeight: compartmentsExpanded ? '248px' : 'auto',
            overflowY: 'auto',
          }}
        >
          {compartments.map((compartment, i) => (
            <CompartmentRow
              key={compartment}
              compartment={compartment}
              value={getCompartmentValue(compartment)}
              index={i}
            />
          ))}
        </List>
      </ScrollSyncPane>
      <Button
        id='toggle-expanded-compartments-button'
        variant='outlined'
        color='primary'
        disabled={compartments.length < 5}
        sx={{
          margin: theme.spacing(3),
          marginTop: theme.spacing(4),
          marginBottom: 0,
          padding: theme.spacing(1),
        }}
        aria-label={t('scenario.more')}
        onClick={() => {
          dispatch(toggleCompartmentExpansion());
          if (
            compartments.findIndex((o) => {
              return o === selectedCompartment;
            }) > 4
          ) {
            if (compartments.length > 0) {
              dispatch(selectCompartment(compartments[0]));
            }
          }
        }}
      >
        {compartmentsExpanded ? t('less') : t('more')}
      </Button>
    </Box>
  );
}

/** This component renders the simulation start date together with a descriptive label. */
function SimulationStartTitle(): JSX.Element {
  const theme = useTheme();
  const {t} = useTranslation();
  const dispatch = useAppDispatch();

  const startDay = useAppSelector((state) => state.dataSelection.simulationStart);
  const minDate = useAppSelector((state) => state.dataSelection.minDate);
  const maxDate = useAppSelector((state) => state.dataSelection.maxDate);

  function updateDate(newDate: Dayjs | null) {
    if (newDate) {
      dispatch(setStartDate(dateToISOString(newDate.toDate())));
    }
  }

  return (
    <Box
      id='scenario-view-compartment-list-date'
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        height: '3rem',
        marginLeft: theme.spacing(3),
        marginRight: 0,
        marginBottom: theme.spacing(1),
        paddingRight: theme.spacing(3),

        // This invisible border mirrors the existing border of the scenario cards and ensures correct alignment.
        borderTop: '2px solid transparent',
      }}
    >
      <DatePicker<Dayjs>
        label={t('scenario.reference-day')}
        value={dayjs(startDay)}
        minDate={dayjs(minDate)}
        maxDate={dayjs(maxDate)}
        onChange={updateDate}
        slotProps={{textField: {size: 'small'}}}
      />
    </Box>
  );
}

interface CompartmentRowProps {
  /** The name of the compartment. */
  compartment: string;

  /** The value of the compartment at simulation start. */
  value: string;

  /** The index of the compartment. */
  index: number;
}

/**
 * This component renders a single row of the compartment list. To the left the name will be displayed and to the right
 * the value at simulation start. If the index of the compartment is greater than three and the compartment list is not
 * in the expanded mode this component will be hidden.
 */
function CompartmentRow(props: CompartmentRowProps): JSX.Element {
  const {t: tBackend} = useTranslation('backend');
  const theme = useTheme();

  const dispatch = useAppDispatch();
  const compartmentsExpanded = useAppSelector((state) => state.dataSelection.compartmentsExpanded);
  const selectedCompartment = useAppSelector((state) => state.dataSelection.compartment);

  const selected = useMemo(() => props.compartment === selectedCompartment, [props.compartment, selectedCompartment]);

  const [tooltipOpen, setTooltipOpen] = useState(false);

  const openTooltip = (e: MouseEvent) => {
    e.stopPropagation();
    setTooltipOpen(true);
  };

  const closeTooltip = () => setTooltipOpen(false);

  return (
    <ListItemButton
      key={props.compartment}
      sx={{
        display: compartmentsExpanded || props.index < 4 ? 'flex' : 'none',
        maxHeight: '36px', // Ensure, that emojis don't screw with the line height!
        padding: theme.spacing(1),
        paddingLeft: theme.spacing(3),
        paddingRight: theme.spacing(3),
        margin: theme.spacing(0),
        marginTop: theme.spacing(1),
        borderLeft: `2px ${selected ? theme.palette.primary.main : 'transparent'} solid`,
        borderTop: `2px ${selected ? theme.palette.background.paper : 'transparent'} solid`,
        borderBottom: `2px ${selected ? theme.palette.background.paper : 'transparent'} solid`,
        '&.MuiListItemButton-root.Mui-selected': {
          backgroundColor: theme.palette.background.paper,
        },
      }}
      selected={selected}
      onClick={() => {
        // dispatch new compartment name
        dispatch(selectCompartment(props.compartment));
      }}
    >
      <ListItemText
        primary={tBackend(`infection-states.${props.compartment}`)}
        // disable child typography overriding this
        disableTypography={true}
        sx={{
          typography: 'listElement',
          fontWeight: selected ? 'bold' : 'normal',
          flexGrow: 1,
          flexBasis: 100,
          zIndex: 20,
        }}
      />
      <ListItemText
        primary={props.value}
        // disable child typography overriding this
        disableTypography={true}
        sx={{
          typography: 'listElement',
          color: selected ? theme.palette.text.primary : theme.palette.text.disabled,
          textAlign: 'right',
          flexGrow: 1,
          zIndex: 20,
        }}
      />
      <ListItemIcon
        id={`infection-state-info-button-${props.compartment}`}
        sx={{
          marginLeft: theme.spacing(2),
          minWidth: 'auto',
        }}
      >
        <ClickAwayListener onClickAway={closeTooltip}>
          <Tooltip
            arrow
            open={tooltipOpen}
            onClose={closeTooltip}
            onClick={openTooltip}
            title={tBackend('infection-states.tooltip')}
          >
            <InfoOutlined
              sx={{
                color: theme.palette.info.light,
                fontSize: '1.1em',
              }}
            />
          </Tooltip>
        </ClickAwayListener>
      </ListItemIcon>
    </ListItemButton>
  );
}
