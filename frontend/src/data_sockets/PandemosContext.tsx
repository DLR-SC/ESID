// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {createContext, useCallback, useEffect, useMemo, useState} from 'react';
import crossfilter, {Crossfilter} from 'crossfilter2';
import agentList from '../../assets/pandemos/agents_lookup.json?url';
import locationList from '../../assets/pandemos/locations_lookup.json?url';
import trajectories from '../../assets/pandemos/trajectories.json?url';
import hash from 'object-hash';
import {Agent, Location, Trip, TripExpanded, TripChain} from 'types/pandemos';
/**
 * Data context for the pandemos data.
 */
export const PandemosContext = createContext<{
  agents: Array<Agent> | undefined;
  locations: Array<Location> | undefined;
  trips: Array<Trip> | undefined;
  expandedTrips: Crossfilter<TripExpanded> | undefined;
  tripChains: Array<TripChain> | undefined;
}>({
  // default values should be undefined or null
  agents: undefined,
  locations: undefined,
  trips: undefined,
  expandedTrips: undefined,
  tripChains: undefined,
});

// Create provider component
export const PandemosProvider = ({children}: {children: React.ReactNode}) => {
  const [agents, setAgents] = useState<Array<Agent>>();
  const [locations, setLocations] = useState<Array<Location>>();
  const [trips, setTrips] = useState<Array<Trip>>();

  const [tripChains, setTripChains] = useState<Array<TripChain>>();

  // Effect to fetch the data
  useEffect(() => {
    Promise.all([
      // Fetch Agents
      fetch(agentList, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }).then(
        (result) => result.json(),
        // on rejected:
        (reason) => console.error('Failed to fetch agents.', reason)
      ),
      // Fetch Locations
      fetch(locationList, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }).then(
        (result) => result.json(),
        // on rejected:
        (reason) => console.error('Failed to fetch locations.', reason)
      ),
      // Fetch Trips
      fetch(trajectories, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'aplication/json',
        },
      }).then(
        (result) => result.json(),
        // on rejected:
        (reason) => console.error('Failed to fetch trips.', reason)
      ),
    ]).then(
      // handle data on promises accept
      ([agents, locations, trips]: [Array<Agent>, Array<Location>, Array<Trip>]) => {
        // setup crossfilter objects for each
        setAgents(agents);
        setLocations(locations);
        setTrips(trips);
      },
      // on promises reject
      (reason) => console.error('Failed to parse Pandemos data.', reason)
    );
    // This should only run once when the page loads
    // TODO: Lazy load when the pandemos tab is selected?
  }, []);

  // Preprocess data to provide a single crossfilter with information of agents & locations included
  const expandedTrips = useMemo<crossfilter.Crossfilter<TripExpanded>>(() => {
    return crossfilter(
      trips?.map((trip) => {
        return {
          ...trip,
          agent_age_group: agents![trip.agent_id].age_group,
          start_location_type: locations![trip.start_location].location_type,
          end_location_type: locations![trip.end_location].location_type,
        } as TripExpanded;
      })
    );
  }, [agents, locations, trips]);


  /*
  useEffect(() => {
    const tripMap = new Map<string, Array<number>>();
    const agentTrips = new Map<number, Array<Trip>>();

    for (const trip of trips ?? []) {
      agentTrips.set(trip.agent_id, [...(agentTrips.get(trip.agent_id) ?? []), trip]);
    }

    let tripId = 0;
    const tripChains = new Map<number, Array<Trip>>();
    for (const tripChain of agentTrips.values()) {
      let start = 0;
      tripChain.forEach((trip, index) => {
        if (getLocation(trip.start_location)?.location_type === 0) start = index;
        if (getLocation(trip.end_location)?.location_type === 0)
          tripChains.set(tripId++, tripChain.slice(start, index + 1));
      });
    }

    setTripChains(tripChains);

    for (const [id, tripChain] of tripChains) {
      const hashed: string = hash(
        tripChain.map((trip) => ({
          activity: trip.activity,
          transportMode: trip.transport_mode,
          start: getLocation(trip.start_location)?.location_type,
          end: getLocation(trip.end_location)?.location_type,
        }))
      );

      tripMap.set(hashed, [...(tripMap.get(hashed) ?? []), id]);
    }

    const sortedTrips = [...tripMap.values()].sort((a, b) => b.length - a.length);
    setTripChainsByOccurrence(sortedTrips);

  }, [getLocation, locations, trips]);
  */

  return (
    <PandemosContext.Provider
      value={{
        agents,
        locations,
        trips,
        expandedTrips,
        tripChains,
      }}
    >
      {children}
    </PandemosContext.Provider>
  );
};
