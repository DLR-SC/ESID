// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

/** Display names for the diffent enums of the pandemos data */
export namespace KeyInfo {
  /** Locations */
  export const location_type: Record<number, string> = {
    /**         Home */ 0: '🏡',
    /**       School */ 1: '🏫',
    /**         Work */ 2: '🏭/🏢',
    /** Social Event */ 3: '🏟',
    /**     Shopping */ 4: '🏪',
    /**     Hospital */ 5: '🏥❗',
    /**          ICU */ 6: '🏥‼',
    /**          Car */ 7: '🚘',
    /**       Public */ 8: '⛲',
    /**    Transport */ 9: '🚍',
    /**     Cemetery */ 10: '⚰',
  };

  export const transport_mode: Record<number, string> = {
    /**            Bike */ 0: '🚴‍♀️',
    /**    Car (Driver) */ 1: '🚘👤',
    /** Car (Passenger) */ 2: '🚘👥',
    /**             Bus */ 3: '🚍',
    /**         Walking */ 4: '🚶‍♀️',
    /**           Other */ 5: '🛸',
    /**         Unknown */ 6: '❓',
  };
  
  export const activity: Record<number, string> = {
    /**       Workplace */ 0: 'Workplace',
    /**       Education */ 1: 'Education',
    /**        Shopping */ 2: 'Shopping',
    /**         Leisure */ 3: 'Leisure',
    /** Private Matters */ 4: 'Private Matters',
    /**           Other */ 5: 'Other',
    /**      Going Home */ 6: 'Going Home',
    /**         Unknown */ 7: 'Unknown',
  };
  export const infection_state: Record<number, string> = {
    /**                     Susceptible */ 0: '🙂',
    /**       Infected with no symptoms */ 1: '🤔',
    /**          Infected with symptoms */ 2: '🤧',
    /**   Infected with severe symptoms */ 3: '🤒',
    /** Infected with critical symptoms */ 4: '🤮',
    /**                       Recovered */ 5: '😀',
    /**                            Dead */ 6: '💀',
    /**                         Unknown */ 7: '❓',
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

export interface TripChain {
  chain_id: number;
  agent_id: number;
  trips: Array<Trip>;
}