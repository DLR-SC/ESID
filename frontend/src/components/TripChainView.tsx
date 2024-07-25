// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {useContext} from 'react';
import {
  activityNames,
  infectionStateNames,
  locationNames,
  PandemosContext,
  transportNames,
  Trip,
} from '../data_sockets/PandemosContext';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import {Card, Chip, List, ListItem} from '@mui/material';
import Divider from '@mui/material/Divider';

function TripChainTransport(props: {modeOfTransport: string}): JSX.Element {
  return <Chip label={<Typography sx={{fontSize: '14px'}}>{props.modeOfTransport}</Typography>} variant='outlined' />;
}

function SimpleTripChain(props: {tripChain: Array<Trip>}): JSX.Element {
  return (
    <Box display='flex' flexDirection='row' alignItems='center' margin='4px'>
      <Card sx={{padding: '4px'}}>
        <Typography sx={{fontSize: '20px'}}>{locationNames[0]}</Typography>
      </Card>
      {props.tripChain.map((trip) => {
        return (
          <>
            <Box key={trip.trip_id} display='flex' flexDirection='row' alignItems='center'>
              <Box alignSelf='flex-start' display='flex' flexDirection='column' alignItems='center'>
                <Typography sx={{marginX: '4px'}}>{infectionStateNames[trip.infection_state]}</Typography>
                <Divider orientation='horizontal' sx={{width: '100%'}} />
                <Typography sx={{visibility: 'hidden'}}>{infectionStateNames[trip.infection_state]}</Typography>
              </Box>
              <TripChainTransport modeOfTransport={transportNames[trip.transport_mode]} />
              <Box alignSelf='flex-end' display='flex' flexDirection='column' alignItems='center'>
                <Typography variant='caption' sx={{visibility: 'hidden'}}>
                  {activityNames[trip.activity]}
                </Typography>
                <Divider orientation='horizontal' sx={{width: '100%'}} />
                <Typography sx={{marginX: '4px'}} variant='caption'>
                  {activityNames[trip.activity]}
                </Typography>
              </Box>
            </Box>
            <Card sx={{margin: '0px', padding: '4px'}}>
              <Typography sx={{fontSize: '20px'}}>{locationNames[0]}</Typography>
            </Card>
          </>
        );
      })}
    </Box>
  );
}

export default function TripChainView(): JSX.Element {
  const context = useContext(PandemosContext);

  return (
    <List>
      {context.tripChainsByOccurrence?.map((tc) => {
        return (
          <ListItem key={tc[0]} divider dense>
            <Typography fontWeight='bold' sx={{minWidth: '70px', textAlign: 'right'}}>
              {tc.length}x
            </Typography>
            <Divider sx={{margin: '4px'}} orientation='vertical' flexItem />
            <SimpleTripChain tripChain={context.tripChains?.get(tc[0]) ?? []} />
          </ListItem>
        );
      })}
    </List>
  );
}
