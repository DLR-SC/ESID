// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {useCallback, useContext, useMemo, useState, useEffect} from 'react';
import {
  infectionStateNames,
  locationNames,
  PandemosContext,
  transportNames,
} from '../data_sockets/PandemosContext';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import {Card, Checkbox, Chip, FormControlLabel, List, ListItem} from '@mui/material';
import Divider from '@mui/material/Divider';
import hash from 'object-hash';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import {infectionStates, susceptibleStates} from './InspireGridComponents/Constants';
import {Trip, Location} from '../types/pandemos';

function TripChainTransport(props: {modeOfTransport: string}): JSX.Element {
  return <Chip label={<Typography sx={{fontSize: '14px'}}>{props.modeOfTransport}</Typography>} variant='outlined' />;
}

function SimpleTripChain(props: {
  tripChain: Array<Trip>;
  showLocations: boolean;
  showTransport: boolean;
  getLocation: (id: number) => Location | undefined;
}): JSX.Element {
  return (
    <Box display='flex' flexDirection='row' alignItems='center' margin='4px'>
      <Card sx={{padding: '4px'}}>
        <Typography sx={{fontSize: '20px'}}>{props.showLocations ? locationNames[0] : '🌐'}</Typography>
      </Card>
      {props.tripChain.map((trip, index) => {
        const previousInfectionState = index > 0 ? props.tripChain[index - 1].infection_state : undefined;

        return (
          <>
            <Box key={trip.trip_id} display='flex' flexDirection='row' alignItems='center'>
              {trip.infection_state === previousInfectionState ? (
                <Divider orientation='horizontal' sx={{width: '16px'}} />
              ) : (
                <Box alignSelf='flex-start' display='flex' flexDirection='column' alignItems='center'>
                  <Typography sx={{marginX: '4px'}}>{infectionStateNames[trip.infection_state]}</Typography>
                  <Divider orientation='horizontal' sx={{width: '100%'}} />
                  <Typography sx={{visibility: 'hidden'}}>{infectionStateNames[trip.infection_state]}</Typography>
                </Box>
              )}
              <TripChainTransport modeOfTransport={props.showTransport ? transportNames[trip.transport_mode] : '→'} />
              <Divider orientation='horizontal' sx={{width: '16px'}} />
            </Box>
            <Card sx={{margin: '0px', padding: '4px'}}>
              <Typography sx={{fontSize: '20px', whiteSpace: 'nowrap'}}>
                {props.showLocations ? locationNames[props.getLocation(trip.end_location)?.location_type ?? 7] : '🌐'}
              </Typography>
            </Card>
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

  const [filterInfections, setFilterInfections] = useState(true);
  const [filterTransports, setFilterTransports] = useState(true);
  const [filterLocations, setFilterLocations] = useState(true);

  const tripChainsByOccurrence = useMemo(() => {
    if (!context.tripChains) {
      return [];
    }

    const tripMap = new Map<string, Array<number>>();
    for (const [id, tripChain] of context.tripChains) {
      if (
        filterInfections &&
        !tripChain.find(
          (trip, index) =>
            infectionStates.includes(trip.infection_state)
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

  const [maxDisplayed, setMaxDisplayed] = useState(0);

  useEffect(() => {
    if (context.setFilteredTripChains) {
      context.setFilteredTripChains(tripChainsByOccurrence.slice(0, maxDisplayed > 0 ? maxDisplayed : 100));
    }
  }, [tripChainsByOccurrence, context.setFilteredTripChains, maxDisplayed, context]);

  return (
    <Box width='100%' height='100%' overflow='hidden' display='flex' flexDirection='column'>
      <Box display='flex' flexDirection='column' margin='16px'>
        <FormControlLabel
          control={<Checkbox checked={filterInfections} onChange={(_, checked) => setFilterInfections(checked)} />}
          label='Only trip chains containing infected people'
        />
        <FormControlLabel
          control={<Checkbox checked={filterTransports} onChange={(_, checked) => setFilterTransports(checked)} />}
          label='Group by mode of transport'
        />
        <FormControlLabel
          control={<Checkbox checked={filterLocations} onChange={(_, checked) => setFilterLocations(checked)} />}
          label='Group by type of location'
        />
        <ToggleButtonGroup
          size='small'
          color='primary'
          value={maxDisplayed > 0 ? maxDisplayed.toString() : '100'}
          exclusive
          fullWidth
          onChange={(_, value: string) => setMaxDisplayed(parseInt(value))}
        >
          <ToggleButton value='10'>10</ToggleButton>
          <ToggleButton value='20'>20</ToggleButton>
          <ToggleButton value='100'>100</ToggleButton>
        </ToggleButtonGroup>
      </Box>
      <List sx={{minWidth: '100%', flexGrow: 1, overflow: 'auto'}}>
        {tripChainsByOccurrence?.slice(0, maxDisplayed > 0 ? maxDisplayed : 100).map((tc) => {
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
