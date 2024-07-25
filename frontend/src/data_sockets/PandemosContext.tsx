// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {createContext, useCallback, useEffect, useMemo, useState} from 'react';
import crossfilter, {Crossfilter} from 'crossfilter2';
import agentList from '../../assets/pandemos/agents_lookup.json?url';
import locationList from '../../assets/pandemos/locations_lookup.json?url';
import trajectories from '../../assets/pandemos/trajectories.json?url';
import hash from 'object-hash';

 export namespace KeyInfo {
  export const location_type: Record<number, string> = {
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

  export const transport_mode: Record<number, string> = {
    0: '🚴‍♀️', // Bike
    1: '🚘👤', // Car (Driver)
    2: '🚘👥', // Car (Passenger)
    3: '🚍', // Bus
    4: '🚶‍♀️', // Walking
    5: '🛸', // Other
    6: '❓', // Unknown
  };
  
  export const activity: Record<number, string> = {
    0: 'Workplace',
    1: 'Education',
    2: 'Shopping',
    3: 'Leisure',
    4: 'Private Matters',
    5: 'Other',
    6: 'Going Home',
    7: 'Unknown',
  };
  export const infection_state: Record<number, string> = {
    0: '🙂', // Susceptible
    1: '🤔', // Infected with no symptoms
    2: '🤧', // Infected with symptoms
    3: '🤒', // Infected with severe symptoms
    4: '🤮', // Infected with critical symptoms
    5: '😀', // Recovered
    6: '💀', // Dead
    7: '❓', // Unknown
  }; 
}

export interface Agent {
  /** ID of the agent (same as index) */
  agent_id: number;
  /** Location ID of the agent's home */
  home_id: number;
  /** Enum of the agent's age group (refer to key_info.md for more info) */
  age_group: number;
}

export interface Location {
  /** ID of the location (same as index) */
  location_id: number;
  /** Enum of the location's type (refer to key_info.md for more info) */
  location_type: number;
  /** Latitude of the location */
  lat: number;
  /** Longitude of the location */
  lon: number;
}

export interface Trip {
  /** Timestep in which the trip took place */
  timestep: number;
  /** ID of the agent who did the trip */
  agent_id: number;
  /** ID of the trip (same as index) */
  trip_id: number;
  /** ID of the start location */
  start_location: number;
  /** ID of the end location */
  end_location: number;
  /** Time in seconds when the trip started */
  start_time: number;
  /** Time in seconds when the trip ended */
  end_time: number;
  /** Enum of the mode of transportation used (refer to key_info.md for more info) */
  transport_mode: number;
  /** Enum of the activity type at the end of this trip (refer to key_info.md for more info) */
  activity: number;
  /** Enum of the infection state of this trip (refer to key_info.md for more info) */
  infection_state: number;
}

export interface TripExpanded extends Trip {
  agent_age_group: number;
  start_location_type: number;
  end_location_type: number;
}

/** 
 * Data context for the pandemos data.
 */
export const PandemosContext = createContext<{
  agents: Array<Agent> | undefined;
  locations: Array<Location> | undefined;
  trips: Array<Trip> | undefined;
  expandedTrips: Crossfilter<TripExpanded> | undefined;
  tripChains: Map<number, Array<Trip>> | undefined;
  tripChainsByOccurrence: number[][] | undefined;
}>({
  // default values should be undefined or null
  agents: undefined,
  locations: undefined,
  trips: undefined,
  expandedTrips: undefined,
  tripChains: undefined,
  tripChainsByOccurrence: undefined,
});

// Create provider component
export const PandemosProvider = ({children}: {children: React.ReactNode}) => {
  const [agents, setAgents] = useState<Array<Agent>>();
  const [locations, setLocations] = useState<Array<Location>>();
  const [trips, setTrips] = useState<Array<Trip>>();

  const [tripChains, setTripChains] = useState<Map<number, Array<Trip>>>();
  const [tripChainsByOccurrence, setTripChainsByOccurrence] = useState<Array<number[]>>();

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
  // TODO: Do we also need lat & lon here? @apoorvakay
  const expandedTrips = useMemo<crossfilter.Crossfilter<TripExpanded>>(() => {
    return crossfilter(trips?.map((trip) => {
      return {
        ...trip,
        agent_age_group: agents![trip.agent_id].age_group,
        start_location_type: locations![trip.start_location].location_type,
        end_location_type: locations![trip.end_location].location_type,
      } as TripExpanded
    }))
  }, [agents, locations, trips])

  const getLocation = useCallback(
    (id: number) => {
      if (!locations || id < 0 || id >= locations.length) {
        console.error('location ID out of bounds', id, locations);
      }
      return locations![id];
    },
    [locations]
  );



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

    // TODO: Just print out the top 10 trip chains.
    for (const chains of sortedTrips.slice(0, 10)) {
      if (locations && chains.length > 0) {
        console.log(chains.length);
        printTripChain(tripChains.get(chains[0])!, locations);
      }
    }
  }, [getLocation, locations, trips]);

  return (
    <PandemosContext.Provider
      value={{
        agents,
        locations,
        trips,
        expandedTrips,
        tripChains,
        tripChainsByOccurrence: tripChainsByOccurrence,
      }}
    >
      {children}
    </PandemosContext.Provider>
  );
};

function printTripChain(tripChain: Array<Trip>, locations: Readonly<Array<Location>>) {
  const getLocation = (id: number) => {
    return KeyInfo.location_type[locations.find((location) => location.location_id === id)?.location_type ?? -1] ?? 'unknown';
  };

  console.log(`Agent: ${tripChain[0].agent_id}, Trips: ${tripChain.length}`);
  const chainString = tripChain.reduce((previousValue: string, trip: Trip) => {
    return (
      previousValue +
      ` —(${KeyInfo.transport_mode[trip.transport_mode]})⇾ ` +
      getLocation(trip.end_location) +
      ` [${KeyInfo.activity[trip.activity]}]`
    );
  }, getLocation(tripChain[0].start_location));

  console.log(chainString);
}
