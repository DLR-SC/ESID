// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {useTheme} from '@mui/material/styles';
import {useAppSelector} from '../../store/hooks';
import React from 'react';
import Box from '@mui/material/Box';
import {useGetSingleGroupFilterDataQuery} from '../../store/services/groupApi';
import Typography from '@mui/material/Typography';
import {useTranslation} from 'react-i18next';
import {NumberFormatter} from '../../util/hooks';
import {ScrollSyncPane} from 'react-scroll-sync';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import {GroupFilter} from '../../types/group';

/**
 * This is responsible for displaying an active group filter.
 */
export function GroupFilterCard(props: GroupFilterCardProps): JSX.Element | null {
  const theme = useTheme();

  return (
    <Box
      id={`scenario-card-${props.scenarioId}-group-filter-root-${props.groupFilterIndex}`}
      key={props.groupFilter.name}
      sx={{
        padding: theme.spacing(2),
        paddingLeft: `calc(${theme.spacing(2)} + 6px)`,
        margin: '6px',
        marginLeft: '0',
        alignContent: 'center',
        borderLeft: props.groupFilterIndex == 0 ? null : `1px solid`,
        borderColor: props.groupFilterIndex == 0 ? null : 'divider',
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
          {props.groupFilter.name}
        </Typography>
      </Box>
      <GroupFilterCardCompartmentValues
        groupFilter={props.groupFilter}
        groupFilterIndex={props.groupFilterIndex}
        scenarioId={props.scenarioId}
      />
    </Box>
  );
}

/**
 * This component renders all compartment values of a group filter in one column.
 */
function GroupFilterCardCompartmentValues(props: GroupFilterCardProps): JSX.Element | null {
  const {t, i18n} = useTranslation();
  const theme = useTheme();

  const {formatNumber} = NumberFormatter(i18n.language, 1, 0);

  const day = useAppSelector((state) => state.dataSelection.date);
  const node = useAppSelector((state) => state.dataSelection.district?.ags);
  const selectedCompartment = useAppSelector((state) => state.dataSelection.compartment);
  const compartmentsExpanded = useAppSelector((state) => state.dataSelection.compartmentsExpanded);
  const compartments = useAppSelector((state) => state.scenarioList.compartments);

  const {data: groupFilterData} = useGetSingleGroupFilterDataQuery(
    {
      id: props.scenarioId,
      node: node,
      day: day ?? '',
      groupFilter: props.groupFilter,
    },
    {skip: !day || props.scenarioId === 0}
  );

  const getGroupValue = (compartment: string): string => {
    if (!groupFilterData) {
      return t('no-data');
    }

    const groupFilterResults = groupFilterData.results;
    if (groupFilterResults.length === 0 || !(compartment in groupFilterResults[0].compartments)) {
      return t('no-data');
    }

    return formatNumber(groupFilterResults[0].compartments[compartment]);
  };

  return (
    <ScrollSyncPane group='compartments'>
      <List
        id={`scenario-card-${props.scenarioId}-group-filter-compartment-list-${props.groupFilterIndex}`}
        className='hide-scrollbar'
        dense={true}
        disablePadding={true}
        sx={{
          maxHeight: compartmentsExpanded ? '248px' : 'auto',
          overflowX: 'hidden',
          overflowY: 'auto',
        }}
      >
        {compartments.map((compartment, i) => {
          return (
            <ListItem
              key={compartment}
              sx={{
                // hide compartment if compartmentsExpanded false and index > 4
                display: compartmentsExpanded || i < 4 ? 'flex' : 'none',
                // highlight compartment if selectedCompartment === compartment
                color: selectedCompartment === compartment ? theme.palette.text.primary : theme.palette.text.disabled,
                alignContent: 'center',
                padding: theme.spacing(1),
                margin: theme.spacing(0),
                marginTop: theme.spacing(1),
                borderTop: '2px solid transparent',
                borderBottom: '2px solid transparent',
              }}
            >
              <ListItemText
                primary={getGroupValue(compartment)}
                // disable child typography overriding this
                disableTypography={true}
                sx={{
                  typography: 'listElement',
                  textAlign: 'right',
                  minWidth: '88px',
                }}
              />
            </ListItem>
          );
        })}
      </List>
    </ScrollSyncPane>
  );
}

interface GroupFilterCardProps {
  /** The group filter the cards belongs to. */
  groupFilter: GroupFilter;

  /** The index in the list of group filters. */
  groupFilterIndex: number;

  /** The scenario id. */
  scenarioId: number;
}
