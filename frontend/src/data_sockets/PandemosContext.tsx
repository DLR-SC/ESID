// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {createContext, useCallback, useEffect, useMemo, useState} from 'react';
import crossfilter, {Crossfilter} from 'crossfilter2';
import agentList from '../../assets/pandemos/agents_lookup.json?url';
import locationList from '../../assets/pandemos/locations_lookup.json?url';
import trajectories from '../../assets/pandemos/trajectories.json?url';
import {Agent, Location, Trip, TripExpanded} from '../types/pandemos';

/** Data context for the pandemos data.
 *  Provides Crossfilter objects for agents, locations, and trips.
 *  Use .all() to get raw array.
 */
export const PandemosContext = createContext<{
  agents: Array<Agent> | undefined;
  locations: Array<Location> | undefined;
  trips: Array<Trip> | undefined;
  expandedTrips: Crossfilter<TripExpanded> | undefined;
  tripChains: Map<number, Array<Trip>> | undefined;
  filteredTripChains: number[][] | undefined;
  setFilteredTripChains: ((value: number[][]) => void) | undefined;
}>({
  // default values should be undefined or null
  agents: undefined,
  locations: undefined,
  trips: undefined,
  expandedTrips: undefined,
  tripChains: undefined,
  filteredTripChains: undefined,
  setFilteredTripChains: undefined,
});

// Create provider component
export const PandemosProvider = ({children}: {children: React.ReactNode}) => {
  const [agents, setAgents] = useState<Array<Agent>>();
  const [locations, setLocations] = useState<Array<Location>>();
  const [trips, setTrips] = useState<Array<Trip>>();

  const [tripChains, setTripChains] = useState<Map<number, Array<Trip>>>();
  const [filteredTripChains, setFilteredTripChains] = useState<number[][]>([]);

 

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

  const getLocation = useCallback(
    (id: number) => {
      return locations?.find((location) => location.location_id === id);
    },
    [locations]
  );

  useEffect(() => {
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
        if (getLocation(trip.end_location)?.location_type === 0 || getLocation(trip.end_location)?.location_type === 10)
          tripChains.set(tripId++, tripChain.slice(start, index + 1));
      });
    }

    setTripChains(tripChains);
  }, [getLocation, locations, trips]);
  // Preprocess a single crossfilter with information of agents & locations included in the trips

  const expandedTrips = useMemo<crossfilter.Crossfilter<TripExpanded>>(() => {
    if (trips && agents && locations) {
      return crossfilter(
        trips?.map((trip) => {
          return (
            ({
              ...trip,
              agent_age_group: agents[trip.agent_id].age_group,
              start_location_type: locations[trip.start_location].location_type,
              end_location_type: locations[trip.end_location].location_type,
            } as TripExpanded) ?? {}
          );
        })
      );
    } else {
      return crossfilter([]);
    }
  }, [agents, locations, trips]);

  return (
    <PandemosContext.Provider
      value={{
        agents,
        locations,
        trips,
        expandedTrips,
        tripChains,
        filteredTripChains,
        setFilteredTripChains,
      }}
    >
      {children}
    </PandemosContext.Provider>
  );
};

export const locationNames: Record<number, string> = {
  0: '🏡', // Home
  1: '🏫', // School
  2: '🏭/🏢', // Work
  3: '🏟', // Social Event
  4: '🏪', // Shopping
  5: '🏥❗', // Hospital
  6: '🏥‼', // ICU
  7: '🚘', // Car
  8: '⛲', // Public
  9: '🚍', // Transport
  10: '⚰', // Cemetery
};

export const transportNames: Record<number, string> = {
  0: '🚴‍♀️', // Bike
  1: '🚘👤', // Car (Driver)
  2: '🚘👥', // Car (Passenger)
  3: '🚍', // Bus
  4: '🚶‍♀️', // Walking
  5: '🛸', // Other
  6: '❓', // Unknown
};

export const activityNames: Record<number, string> = {
  0: 'Workplace',
  1: 'Education',
  2: 'Shopping',
  3: 'Leisure',
  4: 'Private Matters',
  5: 'Other',
  6: 'Going Home',
  7: 'Unknown',
};

export const infectionStateNames: Record<number, string> = {
  0: '🙂', // Susceptible
  1: '🤔', // Infected with no symptoms
  2: '🤧', // Infected with symptoms
  3: '🤒', // Infected with severe symptoms
  4: '🤮', // Infected with critical symptoms
  5: '😀', // Recovered
  6: '💀', // Dead
  7: '❓', // Unknown
};
