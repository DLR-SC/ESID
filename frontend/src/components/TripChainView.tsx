// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {useCallback, useContext, useMemo, useState, useEffect} from 'react';
import {infectionStateNames, locationNames, PandemosContext} from '../data_sockets/PandemosContext';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import FormControlLabel from '@mui/material/FormControlLabel';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Slider from '@mui/material/Slider';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import hash from 'object-hash';
import {infectionStates, susceptibleStates} from './InspireGridComponents/Constants';
import {Trip, Location, KeyInfo} from '../types/pandemos';

function TripChainTransport(props: {icon: string; fullName: string}): JSX.Element {
  return (
    <Chip
      label={
        <Tooltip arrow title={props.fullName}>
          <Typography sx={{fontSize: '14px'}}>{props.icon}</Typography>
        </Tooltip>
      }
      variant='outlined'
    />
  );
}

function SimpleTripChain(props: {
  tripChain: Array<Trip>;
  showLocations: boolean;
  showTransport: boolean;
  getLocation: (id: number) => Location | undefined;
}): JSX.Element {
  return (
    <Box display='flex' flexDirection='row' alignItems='center' margin='4px'>
      <Tooltip arrow title={props.showLocations ? 'Home' : ''}>
        <Card sx={{padding: '4px'}}>
          <Typography sx={{fontSize: '20px'}}>{props.showLocations ? locationNames[0] : '🌐'}</Typography>
        </Card>
      </Tooltip>
      {props.tripChain.map((trip, index) => {
        const previousInfectionState = index > 0 ? props.tripChain[index - 1].infection_state : undefined;

        return (
          <>
            <Box key={trip.trip_id} display='flex' flexDirection='row' alignItems='center'>
              {trip.infection_state === previousInfectionState ? (
                <Divider orientation='horizontal' sx={{width: '16px'}} />
              ) : (
                <Box alignSelf='flex-start' display='flex' flexDirection='column' alignItems='center'>
                  <Tooltip arrow title={KeyInfo.infection_state[trip.infection_state].fullName}>
                    <Typography sx={{marginX: '4px'}}>{infectionStateNames[trip.infection_state]}</Typography>
                  </Tooltip>
                  <Divider orientation='horizontal' sx={{width: '100%'}} />
                  <Typography sx={{visibility: 'hidden'}}>{infectionStateNames[trip.infection_state]}</Typography>
                </Box>
              )}
              <TripChainTransport
                icon={props.showTransport ? KeyInfo.transport_mode[trip.transport_mode].icon : '→'}
                fullName={props.showTransport ? KeyInfo.transport_mode[trip.transport_mode].fullName : ''}
              />
              <Divider orientation='horizontal' sx={{width: '16px'}} />
            </Box>
            <Tooltip
              arrow
              title={
                props.showLocations
                  ? KeyInfo.location_type[props.getLocation(trip.end_location)?.location_type ?? 0].fullName
                  : ''
              }
            >
              <Card sx={{margin: '0px', padding: '4px'}}>
                <Typography sx={{fontSize: '20px', whiteSpace: 'nowrap'}}>
                  {props.showLocations ? locationNames[props.getLocation(trip.end_location)?.location_type ?? 7] : '🌐'}
                </Typography>
              </Card>
            </Tooltip>
          </>
        );
      })}
    </Box>
  );
}

export default function TripChainView(): JSX.Element {
  const context = useContext(PandemosContext);

  const getLocation = useCallback(
    (id: number) => {
      return context.locations?.find((location) => location.location_id === id);
    },
    [context.locations]
  );

  const [filterInfections, setFilterInfections] = useState<'all' | 'infected' | 'newInfections'>('newInfections');
  const [filterTransports, setFilterTransports] = useState(true);
  const [filterLocations, setFilterLocations] = useState(true);

  const tripChainsByOccurrence = useMemo(() => {
    if (!context.tripChains) {
      return [];
    }

    const tripMap = new Map<string, Array<number>>();
    for (const [id, tripChain] of context.tripChains) {
      if (
        filterInfections === 'infected' &&
        !tripChain.find((trip) => infectionStates.includes(trip.infection_state))
      ) {
        continue;
      } else if (
        filterInfections === 'newInfections' &&
        !(
          tripChain.find((trip) => susceptibleStates.includes(trip.infection_state)) &&
          tripChain.find((trip) => infectionStates.includes(trip.infection_state))
        )
      ) {
        continue;
      }

      const hashed: string = hash(
        tripChain.map((trip) => ({
          infectionState: trip.infection_state,
          transportMode: filterTransports ? trip.transport_mode : undefined,
          end: filterLocations ? getLocation(trip.end_location)?.location_type : undefined,
        }))
      );

      tripMap.set(hashed, [...(tripMap.get(hashed) ?? []), id]);
    }

    return [...tripMap.values()].sort((a, b) => b.length - a.length);
  }, [context.tripChains, filterInfections, filterLocations, filterTransports, getLocation]);

  const [maxDisplayed, setMaxDisplayed] = useState(15);

  useEffect(() => {
    if (context.setFilteredTripChains) {
      context.setFilteredTripChains(tripChainsByOccurrence.slice(0, maxDisplayed < 51 ? maxDisplayed : -1));
    }
  }, [tripChainsByOccurrence, context.setFilteredTripChains, maxDisplayed, context]);

  return (
    <Box width='100%' height='100%' overflow='hidden' display='flex' flexDirection='column'>
      <Box display='flex' flexDirection='column' margin='16px'>
        <ToggleButtonGroup
          value={filterInfections}
          color='primary'
          fullWidth
          exclusive
          onChange={(_, value) => setFilterInfections(value)}
        >
          <ToggleButton value='all' aria-label='Show all trips' sx={{textTransform: 'none'}}>
            All trips
          </ToggleButton>
          <ToggleButton value='infected' aria-label='Show trips with infected peope' sx={{textTransform: 'none'}}>
            Only infected people
          </ToggleButton>
          <ToggleButton value='newInfections' aria-label='Show trips with new infections' sx={{textTransform: 'none'}}>
            Only new infections
          </ToggleButton>
        </ToggleButtonGroup>
        <FormControlLabel
          control={<Checkbox checked={filterTransports} onChange={(_, checked) => setFilterTransports(checked)} />}
          label='Group by mode of transport'
        />
        <FormControlLabel
          control={<Checkbox checked={filterLocations} onChange={(_, checked) => setFilterLocations(checked)} />}
          label='Group by type of location'
        />
        <Slider
          aria-label='Always visible'
          defaultValue={maxDisplayed}
          min={1}
          max={51}
          marks={[
            {
              value: 1,
              label: '1',
            },
            {
              value: 10,
              label: '10',
            },
            {
              value: 20,
              label: '20',
            },
            {
              value: 30,
              label: '30',
            },
            {
              value: 40,
              label: '40',
            },
            {
              value: 51,
              label: '♾️',
            },
          ]}
          onChange={(_, value) => setMaxDisplayed(value)}
        />
      </Box>
      <List sx={{minWidth: '100%', flexGrow: 1, overflow: 'auto'}}>
        {tripChainsByOccurrence?.slice(0, maxDisplayed < 51 ? maxDisplayed : -1).map((tc) => {
          return (
            <ListItem key={tc[0]} divider disablePadding>
              <Typography fontWeight='bold' sx={{minWidth: '50px', textAlign: 'right'}}>
                {tc.length}x
              </Typography>
              <Divider sx={{margin: '4px'}} orientation='vertical' flexItem />
              <SimpleTripChain
                tripChain={context.tripChains?.get(tc[0]) ?? []}
                showLocations={filterLocations}
                showTransport={filterTransports}
                getLocation={getLocation}
              />
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
}
