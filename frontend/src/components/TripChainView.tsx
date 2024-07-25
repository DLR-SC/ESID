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
import {Card, Chip, List, ListItem, ListItemText} from '@mui/material';
import Divider from '@mui/material/Divider';

function TripChainTransport(props: {modeOfTransport: string}): JSX.Element {
  return <Chip label={<Typography sx={{fontSize: '14pt'}}>{props.modeOfTransport}</Typography>} variant='outlined' />;
}

function SimpleTripChain(props: {tripChain: Array<Trip>}): JSX.Element {
  return (
    <Box display='flex' flexDirection='row' alignItems='center' margin='6px'>
      <Card sx={{padding: '6px'}}>
        <Typography sx={{fontSize: '20pt'}}>{locationNames[0]}</Typography>
      </Card>
      {props.tripChain.map((trip) => {
        return (
          <>
            <Box key={trip.trip_id} display='flex' flexDirection='row' alignItems='center'>
              <Box alignSelf='flex-start' display='flex' flexDirection='column' alignItems='center'>
                <Typography sx={{marginX: '6px'}}>{infectionStateNames[trip.infection_state]}</Typography>
                <Divider orientation='horizontal' sx={{width: '100%'}} />
                <Typography sx={{visibility: 'hidden'}}>{infectionStateNames[trip.infection_state]}</Typography>
              </Box>
              <TripChainTransport modeOfTransport={transportNames[trip.transport_mode]} />
              <Box alignSelf='flex-end' display='flex' flexDirection='column' alignItems='center'>
                <Typography variant='caption' sx={{visibility: 'hidden'}}>
                  {activityNames[trip.activity]}
                </Typography>
                <Divider orientation='horizontal' sx={{width: '100%'}} />
                <Typography sx={{marginX: '6px'}} variant='caption'>
                  {activityNames[trip.activity]}
                </Typography>
              </Box>
            </Box>
            <Card sx={{margin: '0px', padding: '6px'}}>
              <Typography sx={{fontSize: '20pt'}}>{locationNames[0]}</Typography>
            </Card>
          </>
        );
      })}
    </Box>
  );
}

/*
function TripChain(props: {tripChain: Array<Trip>; showTime?: boolean}): JSX.Element {
  const showTime = props.showTime ?? false;

  return (
    <Timeline>
      {props.tripChain.map((trip) => {
        return (
          <TimelineItem key={trip.trip_id}>
            <TimelineOppositeContent sx={{m: 'auto 0'}} align='right' variant='body2' color='text.secondary'>
              <Typography>{transportNames[trip.transport_mode]}</Typography>
              {showTime
                ? (() => {
                  const date = new Date();
                  date.setSeconds(trip.end_time);
                  return date.toLocaleTimeString();
                })()
                : null}
            </TimelineOppositeContent>
            <TimelineSeparator>
              <TimelineConnector />
              <TimelineDot>{infectionStateNames[trip.infection_state]}</TimelineDot>
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent sx={{m: 'auto 0'}}>
              <Typography>{activityNames[trip.activity]}</Typography>
            </TimelineContent>
          </TimelineItem>
        );
      })}
    </Timeline>
  );
}
*/

export default function TripChainView(): JSX.Element {
  const context = useContext(PandemosContext);

  return (
    <List>
      {context.tripChainsByOccurrence?.map((tc) => {
        return (
          <ListItem key={tc[0]} divider disablePadding>
            <Typography fontWeight='bold' sx={{width: '70px', textAlign: 'right'}}>
              {tc.length}x
            </Typography>
            <Divider sx={{margin: '6px'}} orientation='vertical' flexItem />
            <SimpleTripChain tripChain={context.tripChains?.get(tc[0]) ?? []} />
          </ListItem>
        );
      })}
    </List>
  );
}
