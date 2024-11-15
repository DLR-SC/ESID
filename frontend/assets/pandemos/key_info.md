<!--
SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
SPDX-License-Identifier: CC-BY-4.0
-->

# ABM Data Structure

## movement_data file

| Header            | Description                                                                                                              |
| :---------------- | :----------------------------------------------------------------------------------------------------------------------- |
| agent_id          | ID of the agent, foreign key to look up agents in the [agent list](#agents_lookup-file).                                 |
| trip_id           | ID of the movement (primary key).                                                                                        |
| start_location    | ID of the trip start, foreign key to look up locations in the [location list](#locations_lookup-file).                   |
| end_location      | ID of the trip end, foreign key to look up locations in the [location list](#locations_lookup file).                     |
| start_time        | Start time of the movement in seconds. Currently all movements are instantaneous so the start and end time are the same. |
| end_time          | End time of the movement in seconds. Currently all movements are instantaneous so the start and end time are the same.   |
| transport_mode    | Mode of transportation used for the movement. [Key description below](#transport_mode).                                  |
| activity          | Activity that is the reason for the movement. [Key description below](#activity).                                        |
| infection_state   | Infection state of the agent during this movement. [Key description below](#infection_state).                            |
|                   |                                                                                                                          |
| timestep Nr.: _n_ | Interspersed header marking the beginning of timestep _n_.                                                               |

### transport_mode

| Key | Value            |
| --: | :--------------- |
|   0 | Bike             |
|   1 | Car (Driver)     |
|   2 | Car (Passenger)  |
|   3 | Public Transport |
|   4 | Walking          |
|   5 | Other            |
|   6 | Unknown          |

### activity

| Key | Value           |
| --: | :-------------- |
|   0 | Workplace       |
|   1 | Education       |
|   2 | Shopping        |
|   3 | Leisure         |
|   4 | Private Matters |
|   5 | Other           |
|   6 | Going Home      |
|   7 | Unknown         |

### infection_state

| Key | Value                           |
| --: | :------------------------------ |
|   0 | Susceptible                     |
|   1 | Infected with no symptoms       |
|   2 | Infected with symptoms          |
|   3 | Infected with severe symptoms   |
|   4 | Infected with critical symptoms |
|   5 | Recovered                       |
|   6 | Dead                            |
|   7 | Unknown                         |

## agents_lookup file

| Header   | Description                                                                                              |
| :------- | :------------------------------------------------------------------------------------------------------- |
| agent_id | ID of the agent (primary key).                                                                           |
| home_id  | ID of the home, foreign key to look up the home location in the [location list](#locations_lookup-file). |
| age      | Age group of the agent. [Key description below](#age).                                                   |

### age

| Key | Value             |
| --: | :---------------- |
|   0 | Ages 0 to 4       |
|   1 | Ages 5 to 14      |
|   2 | Ages 15 to 34     |
|   3 | Ages 35 to 59     |
|   4 | Ages 60 to 79     |
|   5 | Ages 80 and older |

## locations_lookup file

| Header        | Description                                                    |
| :------------ | :------------------------------------------------------------- |
| location_id   | ID of the location (primary key).                              |
| location_type | Type of the location. [Key description below](#location_type). |
| latitude      | Latitude of the location in degrees.                           |
| longitude     | Longitude of the location in degrees.                          |

### location_type

| Key | Value                                                     |
| --: | :-------------------------------------------------------- |
|   0 | Home                                                      |
|   1 | School                                                    |
|   2 | Work                                                      |
|   3 | Social Event (will be split into different kinds)         |
|   4 | Basic Shop (for bare necessities i.e. groceries etc.)     |
|   5 | Hospital (generic location with no latitude or longitude) |
|   6 | ICU (generic location with no latitude or longitude)      |
|   7 | Car (currently unused)                                    |
|   8 | Public Transport (currently unused)                       |
|   9 | Transport without Contact (currently unused)              |
|  10 | Cemetery (generic location with no latitude or longitude) |
