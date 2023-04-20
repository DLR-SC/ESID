import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
import {MigrationConnection, TopMigration} from '../../types/migration';

/*
 * This Api already follows the new changes to the API (made by coac)
 */

export const migrationsApi = createApi({
  reducerPath: 'migrationsApi',
  baseQuery: fetchBaseQuery({baseUrl: `${process.env.API_URL || ''}/api/v1/`}),
  endpoints: (builder) => ({
    /**
     * Query to request connections between start node and end nodes (list).
     *
     * @param {MigrationsByNodeParameters} queryParameters
     * @returns {Array<MigrationConnection>}
     */
    getMigrationsByNode: builder.query<Array<MigrationConnection>, MigrationsByNodeParameters>({
      async queryFn(args: MigrationsByNodeParameters, _queryApi, _extraOptions, fetchWithBQ) {
        const queryParameters: Array<string> = [];
        // Add start date if it exists
        if (args.startDate) queryParameters.push(`startDate=${args.startDate}`);
        // Add end date if it exists
        if (args.endDate) queryParameters.push(`endDate=${args.endDate}`);
        // Add compartment and aggregation flag (defaults to false)
        queryParameters.push(
          `compartments=${args.compartment}&aggregation_flag=${args.aggregation_flag ? args.aggregation_flag : 'false'}`
        );
        // Add groups if they exist
        if (args.groups) queryParameters.push(`groups=${args.groups.join(',')}`);
        // Add start node
        queryParameters.push(`startNode=${args.startNode}`);
        // Add end nodes
        queryParameters.push(`endNode=${args.endNode.join(',')}`);

        // Query url with parameters
        const result = await fetchWithBQ(
          `scenarios/${args.scenario_id}/simulations/${args.run_id}/migrations/?${queryParameters.join('&')}`
        );
        // [ ]: Return error if any occurs
        // if (result.error) return {error: result.error};

        // [ ]: Inject dummy data here
        result.data = generateDummyMigrationsByNode(args);

        // Return data
        return {data: result.data as Array<MigrationConnection>};
      },
    }),

    /**
     * Query to request the top connections for a node.
     *
     * @param {TopMigrationsByNodeParameters} queryParameters
     * @returns {TopMigrations}
     */
    getTopMigrationsByNode: builder.query<Array<TopMigration>, TopMigrationsByNodeParameters>({
      async queryFn(args: TopMigrationsByNodeParameters, _queryApi, _extraOptions, fetchWithBQ) {
        const queryParameters: Array<string> = [];
        // Add start date if it exists
        if (args.startDate) queryParameters.push(`starDate=${args.startDate}`);
        // Add end date if it exists
        if (args.endDate) queryParameters.push(`endDate=${args.endDate}`);
        // Add compartments and aggregation flag (defaults to false)
        queryParameters.push(
          `compartments=${args.compartment}&aggregation_flag=${args.aggregation_flag ? args.aggregation_flag : 'false'}`
        );
        // Add groups if they exist
        if (args.groups) queryParameters.push(`groups=${args.groups.join(',')}`);
        // Add requested node
        queryParameters.push(`node=${args.node}`);
        // Add number requested tops if it exists
        if (args.count) queryParameters.push(`count=${args.count}`);
        // Add sorting if it exists
        if (args.sort) queryParameters.push(`sort=${args.sort}`);

        // Query url with parameters
        const result = await fetchWithBQ(
          `scenarios/${args.scenario_id}/simulations/${args.run_id}/topMigrations/?${queryParameters.join('&')}`
        );
        // [ ]: Return error if any occurs
        // if (result.error) return {error: result.error};

        // [ ]: Inject dummy data here
        result.data = generateDummyTopMigrationsByNode(args);

        // Return data
        return {data: result.data as Array<TopMigration>};
      },
    }),
  }),
});

/**
 * Query parameters to request migration between nodes
 *
 * @prop {string}         scenario_id               UUID of the scenario.
 * @prop {string}         run_id                     UUID of the simulation run.
 * @prop {string}         [startDate]               Optional; Timestamp to filter for migrations after start date. If empty, returns all dates since simulation start date.
 * @prop {string}         [endDate]                 Optional; Timestamp to filter for migrations before end date. If empty, returns all dates until simulation end date.
 * @prop {string}         compartment               Specific compartment for Migration values.
 * @prop {boolean}        [aggregation_flag=false]  Indicator if compartment is aggregation or not. Defaults to `false`.
 * @prop {Array<string>}  [groups]                  Optional; List of Group Filter UUIDs for migration values.
 * @prop {string}         startNode                 UUID of the start node of the migration.
 * @prop {Array<string>}  endNode                   List of node-UUIDs of the other endpoints of the migrations.
 */
interface MigrationsByNodeParameters {
  scenario_id: string;
  run_id: string;
  startDate?: string;
  endDate?: string;
  compartment: string;
  aggregation_flag?: boolean;
  groups?: Array<string>;
  startNode: string;
  endNode: Array<string>;
}

/**
 * Query parameters to request top n migrations for a node
 *
 * @prop {string}                       scenario_id         UUID of the scenario.
 * @prop {string}                       run_id               UUID of the simulation run.
 * @prop {string}                       [startDate]         Optional; Timestamp to filter for migrations after start date. If empty, returns all dates since simulation start date.
 * @prop {string}                       [endDate]           Optional; Timestamp to filter for migrations before end date. If empty, returns all dates until simulation end date.
 * @prop {string}                       compartment         Specific compartment for migrations.
 * @prop {boolean}                      [aggregation_flag]  Optional; Indicator if compartment is aggregation or not. Defaults to `false`.
 * @prop {Array<string>}                [groups]            Optional; Group filters for migrations.
 * @prop {string}                       node                UUID of the node the top migrations are requested for.
 * @prop {number}                       count               Number of entries requested from the top (top n entries). N > 0. Defaults to 10.
 * @prop {'incoming'|'outgoing'|'both'} sort                Method to sort before returning the top entries ('both' adds incoming and outgoing values). Defaults to 'incoming'.
 */
interface TopMigrationsByNodeParameters {
  scenario_id: string;
  run_id: string;
  startDate?: string;
  endDate?: string;
  compartment?: string;
  aggregation_flag?: boolean;
  groups?: Array<string>;
  node: string;
  count: number;
  sort: 'incoming' | 'outgoing' | 'total';
}

export const {useGetMigrationsByNodeQuery, useGetTopMigrationsByNodeQuery} = migrationsApi;

// [ ] Function to generate a dummy response for the `getMigrationsByNode`-query until the coac API is put in
function generateDummyMigrationsByNode(args: MigrationsByNodeParameters): Array<MigrationConnection> {
  const retVal: Array<MigrationConnection> = [];
  // set start date to start of simulation if missing
  const startDate = new Date(args.startDate ?? '2021-06-07');
  // set end date to end of simulation if missing
  const endDate = new Date(args.endDate ?? '2021-09-04');
  // set flag for single node request
  const isSingleNode = args.endNode.length === 1;
  // set flag for single date request; use dates with fallback; only use date part of ISO string (YYYY-MM-DD)
  const isSingleDate = startDate.toISOString().substring(0, 10) === endDate.toISOString().substring(0, 10);

  // generate connections for each end node requested
  args.endNode.forEach((endNode) => {
    // generate all connections in between start and end date
    const date = new Date(startDate);
    do {
      // create entry with random incomings & outgoings
      const entry: MigrationConnection = {
        incoming: Math.floor(Math.random() * 100_000),
        outgoing: Math.floor(Math.random() * 100_000),
      };
      // add node if more than one was requested
      if (!isSingleNode) entry.node = endNode;
      // add timestamp if more than one was requested; only use date part of ISO string (YYYY-MM-DD)
      if (!isSingleDate) entry.timestamp = date.toISOString().substring(0, 10);
      // add entry to return array
      retVal.push(entry);
      // increment date by 1 day
      date.setDate(date.getDate() + 1);

      // Stop if start date has reached end date
    } while (date <= endDate);
  });
  return retVal;
}

// [ ] Function to generate a dummy response for the `getTopMigrationsByNode`-query until the coac API is put in
function generateDummyTopMigrationsByNode(args: TopMigrationsByNodeParameters): Array<TopMigration> {
  // fetch lk_germany_reduced_list.json to use real AGS (item["RS"])
  const nodeList: Array<string> = [];
  fetch('assets/lk_germany_reduced_list.json', {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  })
    .then((response) => {
      // interpret content as JSON
      return response.json();
    })
    .then(
      // Resolve Promise
      (
        jsonlist: {
          AGS: string;
          NAME: string;
          BEZ: string;
        }[]
      ) => {
        // put AGS from json into nodelist
        nodeList.push(...jsonlist.flatMap((entry) => entry.AGS));
      },
      // Reject Promise
      () => {
        console.warn('Did not receive proper county list');
      }
    );
  // set start date to start of simulation if missing
  const startDate = new Date(args.startDate ?? '2021-06-07');
  // set end date to end of simulation if missing
  const endDate = new Date(args.endDate ?? '2021-09-04');
  // set flag for single date request; use dates with fallback; only use date part of ISO string (YYYY-MM-DD)
  const isSingleDate = startDate.toISOString().substring(0, 10) === endDate.toISOString().substring(0, 10);
  const retVal: Array<TopMigration> = [];
  do {
    // add n random nodes, check that they are not starting node, and add to this day's array
    for (let i = 0; i < args.count; i++) {
      let node: string = '';
      do {
        // get random node from list of nodes
        node = nodeList[Math.floor(Math.random() * (nodeList.length - 1))];
        // redo if:
      } while (
        // node is requesting node OR
        node == args.node ||
        // node is already in list with same date
        retVal.find(
          (entry) =>
            // node is a duplicate AND
            entry.node === node &&
            // node does not have a timestamp (single date) OR
            (entry.timestamp === undefined ||
              // node has the same timestamp as the duplicate
              entry.timestamp === startDate.toISOString().substring(0, 10))
        )
      );
      // create entry
      const entry: TopMigration = {
        node: node,
      };
      // add timestamp if multiple dates are requested; only use date part of ISO string (YYYY-MM-DD)
      if (!isSingleDate) entry.timestamp = startDate.toISOString().substring(0, 10);
      // add entry to return array
      retVal.push(entry);
    }
    // increment date by 1 day
    startDate.setDate(startDate.getDate() + 1);
    // Stop if start date has reached end date
  } while (startDate <= endDate);
  // return array of top migrations
  return retVal;
}
