// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

/** Display names for the diffent enums of the pandemos data */
/* eslint-disable @typescript-eslint/no-namespace */
export namespace KeyInfo {
  export const anyOption: KeyInfoItem = {
    icon: '🤷',
    fullName: 'Any',
  };
  /** Locations */
  export const location_type: Record<number, KeyInfoItem> = {
    /**            Any */ 99: anyOption,
    /**           Home */ 0: {icon: '🏡', fullName: 'Home'},
    /**         School */ 1: {icon: '🏫', fullName: 'School'},
    /**           Work */ 2: {icon: '🏭/🏢', fullName: 'Work'},
    /**   Social Event */ 3: {icon: '🥂', fullName: 'Social Event'},
    /**       Shopping */ 4: {icon: '🏪', fullName: 'Shop'},
    /**       Hospital */ 5: {icon: '🏥❗', fullName: 'Hospital'},
    /**            ICU */ 6: {icon: '🏥‼', fullName: 'ICU'},
    /**            Car */ 7: {icon: '🚘', fullName: 'Car'},
    /**         Public */ 8: {icon: '⛲', fullName: 'Public Space'},
    /**      Transport */ 9: {icon: '🚍', fullName: 'Public Transport'},
    /** Event Location */ 10: {icon: '🏟️', fullName: 'Event Location'},
    /**       Cemetery */ 11: {icon: '🪦', fullName: 'Cemetery'},
  };

  export const transport_mode: Record<number, KeyInfoItem> = {
    /**         Unknown */ 0: {icon: '❓', fullName: 'Unknown'},
    /**            Bike */ 1: {icon: '🚴‍♀️', fullName: 'Bicycle'},
    /**    Car (Driver) */ 2: {icon: '🚘👤', fullName: 'Car Driver'},
    /** Car (Passenger) */ 3: {icon: '🚘👥', fullName: 'Car Passenger'},
    /**             Bus */ 4: {icon: '🚍', fullName: 'Bus'},
    /**         Walking */ 5: {icon: '🚶‍♀️', fullName: 'Walking'},
    /**           Other */ 6: {icon: '🛸', fullName: 'Other'},
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
  export const infection_state: Record<number, KeyInfoItem> = {
    /**                             Any */ 99: anyOption,
    /**                     Susceptible */ 0: {icon: '🙂', fullName: 'Susceptible to Infection'},
    /**       Infected with no symptoms */ 1: {icon: '🤔', fullName: 'Asymptomatic Infection, not infectious'},
    /**       Infected with no symptoms */ 2: {icon: '😷', fullName: 'Asymptomatic Infection, infectious'},
    /**          Infected with symptoms */ 3: {icon: '🤧', fullName: 'Symptomatic Infection'},
    /**   Infected with severe symptoms */ 4: {icon: '🤒', fullName: 'Severely Symptomatic'},
    /** Infected with critical symptoms */ 5: {icon: '🤮', fullName: 'Critically Symptomatic'},
    /**                       Recovered */ 6: {icon: '😀', fullName: 'Recovered from Infection'},
    /**                            Dead */ 7: {icon: '💀', fullName: 'Deceased'},
  };

  export const age_group: Record<number, KeyInfoItem> = {
    /** Ages 0 to 4 */ 0: {icon: '0-4', fullName: 'Ages 0 to 4'},
    /** Ages 5 to 14 */ 1: {icon: '5-14', fullName: 'Ages 5 to 14'},
    /** Ages 15 to 34 */ 2: {icon: '15-34', fullName: 'Ages 15 to 34'},
    /** Ages 35 to 59 */ 3: {icon: '35-59', fullName: 'Ages 35 to 59'},
    /** Ages 60 to 79 */ 4: {icon: '60-79', fullName: 'Ages 60 to 79'},
    /** Ages 80 and older */ 5: {icon: '80+', fullName: 'Ages 80 and older'},
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
  /** Enum of the location's type (refer to key_info.md for more info) */
  location_type_string: string;
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

export interface KeyInfoItem {
  icon: string;
  fullName: string;
}
