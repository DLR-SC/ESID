import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {ScrollSyncPane} from 'react-scroll-sync';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import {selectCompartment, toggleCompartmentExpansion} from '../../store/DataSelectionSlice';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import React, {useEffect, useState} from 'react';
import {useTheme} from '@mui/material/styles';
import {useTranslation} from 'react-i18next';
import {useAppDispatch, useAppSelector} from '../../store/hooks';
import {Dictionary} from '../../util/util';
import {NumberFormatter} from '../../util/hooks';
import {useGetCaseDataSingleSimulationEntryQuery} from '../../store/services/caseDataApi';

export default function CompartmentList(): JSX.Element {
  const theme = useTheme();
  const {t, i18n} = useTranslation();
  const {t: tBackend} = useTranslation('backend');
  const dispatch = useAppDispatch();
  const {formatNumber} = NumberFormatter(i18n.language, 1, 0);

  const compartments = useAppSelector((state) => state.scenarioList.compartments);
  const selectedCompartment = useAppSelector((state) => state.dataSelection.compartment);
  const compartmentsExpanded = useAppSelector((state) => state.dataSelection.compartmentsExpanded);
  const startDay = useAppSelector((state) => state.dataSelection.minDate);
  const node = useAppSelector((state) => state.dataSelection.district.ags);
  const [compartmentValues, setCompartmentValues] = useState<Dictionary<number> | null>(null);

  const {data: caseData} = useGetCaseDataSingleSimulationEntryQuery(
    {
      node: node,
      day: startDay ?? '',
      groups: ['total'],
    },
    {skip: !startDay}
  );

  const getCompartmentValue = (compartment: string): string => {
    if (compartmentValues && compartment in compartmentValues) {
      return formatNumber(compartmentValues[compartment]);
    }
    return t('no-data');
  };

  useEffect(() => {
    if (caseData) {
      setCompartmentValues(caseData.results[0].compartments);
    }
  }, [caseData]);

  useEffect(() => {
    if (!selectedCompartment && compartments.length > 0) {
      dispatch(selectCompartment(compartments[0]));
    }
  }, [dispatch, compartments, selectedCompartment]);

  return (<Box
    id='scenario-view-compartment-list-root'
    sx={{
      borderRight: `2px dashed ${theme.palette.divider}`,
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
      <Typography
        variant='h2'
        sx={{
          textAlign: 'left',
          height: 'min-content',
          // fontWeight: 'bold',
          fontSize: '13pt',
        }}
      >
        {t('scenario.simulation-start-day')}:
      </Typography>
      <Typography
        variant='h2'
        sx={{
          textAlign: 'right',
          height: 'min-content',
          fontWeight: 'bold',
          fontSize: '13pt',
        }}
      >
        {startDay ? new Date(startDay).toLocaleDateString(i18n.language) : t('today')}
      </Typography>
    </Box>
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
          // map all compartments to display compartment list
          <ListItemButton
            key={compartment}
            sx={{
              display: compartmentsExpanded || i < 4 ? 'flex' : 'none',
              maxHeight: '36px', // Ensure, that emojis don't screw with the line height!
              padding: theme.spacing(1),
              paddingLeft: theme.spacing(3),
              paddingRight: theme.spacing(3),
              margin: theme.spacing(0),
              marginTop: theme.spacing(1),
              borderLeft: `2px ${
                selectedCompartment === compartment ? theme.palette.primary.main : 'transparent'
              } solid`,
              borderTop: `2px ${
                selectedCompartment === compartment ? theme.palette.background.paper : 'transparent'
              } solid`,
              borderBottom: `2px ${
                selectedCompartment === compartment ? theme.palette.background.paper : 'transparent'
              } solid`,
              '&.MuiListItemButton-root.Mui-selected': {
                backgroundColor: theme.palette.background.paper,
              },
            }}
            selected={selectedCompartment === compartment}
            onClick={() => {
              // dispatch new compartment name
              dispatch(selectCompartment(compartment));
            }}
          >
            <ListItemText
              primary={tBackend(`infection-states.${compartment}`)}
              // disable child typography overriding this
              disableTypography={true}
              sx={{
                typography: 'listElement',
                fontWeight: selectedCompartment === compartment ? 'bold' : 'normal',
                flexGrow: 1,
                flexBasis: 100,
                zIndex: 20,
              }}
            />
            <ListItemText
              primary={getCompartmentValue(compartment)}
              // disable child typography overriding this
              disableTypography={true}
              sx={{
                typography: 'listElement',
                color:
                  selectedCompartment === compartment ? theme.palette.text.primary : theme.palette.text.disabled,
                textAlign: 'right',
                flexGrow: 1,
                zIndex: 20,
              }}
            />
          </ListItemButton>
        ))}
      </List>
    </ScrollSyncPane>
    <Button
      variant='outlined'
      color='primary'
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
  </Box>);
}