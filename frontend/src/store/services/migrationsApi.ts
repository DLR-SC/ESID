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

}

export const { useGetMigrationsByNodeQuery, useGetTopMigrationsByNodeQuery } = 
  migrationsApi;