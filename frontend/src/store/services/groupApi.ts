// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {Dictionary} from 'util/util';
import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
import {GroupFilter, GroupResponse} from 'types/group';
/* [CDtemp-begin] */
import cologneData from '../../../assets/stadtteile_cologne_list.json';
import {District} from 'types/cologneDistricts';
/* [CDtemp-end] */

export const groupApi = createApi({
  reducerPath: 'groupApi',
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  baseQuery: fetchBaseQuery({baseUrl: `${import.meta.env.VITE_API_URL || ''}/api/v1/`}),
  endpoints: (builder) => ({
    getGroupCategories: builder.query<GroupCategories, void>({
      query: () => {
        return 'groupcategories/';
      },
    }),

    getGroupSubcategories: builder.query<GroupSubcategories, void>({
      query: () => {
        return 'groups/';
      },
    }),

    getMultipleGroupFilterData: builder.query<Array<Dictionary<GroupResponse>>, PostFilters>({
      async queryFn(arg, _queryApi, _extraOptions, fetchWithBQ) {
        const result: Array<Dictionary<GroupResponse>> = [];
        for (const id of arg.ids) {
          if (arg.groupFilterList) {
            const groupResponse: Dictionary<GroupResponse> = {};
            for (const groupFilter of Object.values(arg.groupFilterList).filter(
              (groupFilter) => groupFilter.isVisible
            )) {
              /* [CDtemp-begin] */
              let node = '';
              let cologneDistrict = '';

              if (arg.node.length > 5) {
                node = arg.node.slice(0, 5);
                cologneDistrict = arg.node.slice(-3);
              } else {
                node = arg.node;
              }
              /* [CDtemp-end] */

              const singleResult = await fetchWithBQ({
                url:
                  `simulation/${id}/${
                    // [CDtemp] post.node
                    node
                  }/?all` +
                  (arg.day ? `&day=${arg.day}` : '') +
                  (arg.compartment ? `&compartments=${arg.compartment}` : ''),
                method: 'POST',
                body: {groups: groupFilter.groups},
              });

              if (singleResult.error) return {error: singleResult.error};

              groupResponse[groupFilter.name] = singleResult.data as GroupResponse;

              /* [CDtemp-begin] */
              // adjust data if it is for a city district
              if (cologneDistrict) {
                // find weight for city district
                const weight = (cologneData as unknown as Array<District>).find(
                  (dist) => dist.Stadtteil_ID === cologneDistrict
                )!.Population_rel;
                // go thru results
                groupResponse[groupFilter.name].results = groupResponse[groupFilter.name].results.map(
                  ({compartments, day, name}) => {
                    // loop thru compartments and apply weight
                    Object.keys(compartments).forEach((compName) => {
                      compartments[compName] *= weight;
                    });
                    return {compartments, day, name};
                  }
                );
              }
              /* [CDtemp-end] */
            }
            result.push(groupResponse);
          }
        }
        return {data: result};
      },
    }),

    getMultipleGroupFilterDataLineChart: builder.query<Dictionary<GroupResponse>, PostFilter[]>({
      async queryFn(arg, _queryApi, _extraOptions, fetchWithBQ) {
        const result: Dictionary<GroupResponse> = {};
        for (const post of arg) {
          /* [CDtemp-begin] */
          let node = '';
          let cologneDistrict = '';

          if (post.node.length > 5) {
            node = post.node.slice(0, 5);
            cologneDistrict = post.node.slice(-3);
          } else {
            node = post.node;
          }
          /* [CDtemp-end] */

          const singleResult = await fetchWithBQ({
            url:
              `simulation/${post.id}/${
                // [CDtemp] post.node
                node
              }/?all` +
              (post.day ? `&day=${post.day}` : '') +
              (post.compartment ? `&compartments=${post.compartment}` : ''),
            method: 'POST',
            body: {groups: post.groupFilter.groups},
          });

          if (singleResult.error) return {error: singleResult.error};

          result[post.groupFilter.name] = singleResult.data as GroupResponse;

          /* [CDtemp-begin] */
          // adjust data if it is for a city district
          if (cologneDistrict) {
            // find weight for city district
            const weight = (cologneData as unknown as Array<District>).find(
              (dist) => dist.Stadtteil_ID === cologneDistrict
            )!.Population_rel;
            // go thru results
            result[post.groupFilter.name].results = result[post.groupFilter.name].results.map(
              ({compartments, day, name}) => {
                // loop thru compartments and apply weight
                Object.keys(compartments).forEach((compName) => {
                  compartments[compName] *= weight;
                });
                return {compartments, day, name};
              }
            );
          }
          /* [CDtemp-end] */
        }
        return {data: result};
      },
    }),

    getSingleGroupFilterData: builder.query<GroupResponse, PostFilter>({
      async queryFn(arg, _queryApi, _extraOptions, fetchWithBQ) {
        /* [CDtemp-begin] */
        let node = '';
        let cologneDistrict = '';

        if (arg.node.length > 5) {
          node = arg.node.slice(0, 5);
          cologneDistrict = arg.node.slice(-3);
        } else {
          node = arg.node;
        }
        /* [CDtemp-end] */

        const result = await fetchWithBQ({
          url:
            `simulation/${arg.id}/${
              // [CDtemp] arg.node
              node
            }/?all` +
            (arg.day ? `&day=${arg.day}` : '') +
            (arg.compartment ? `&compartments=${arg.compartment}` : ''),
          method: 'POST',
          body: {groups: arg.groupFilter.groups},
        });

        if (result.error) return {error: result.error};
        const data = result.data as GroupResponse;

        /* [CDtemp-begin] */
        // Adjust data if it is a city district
        if (cologneDistrict) {
          // find weight for city district
          const weight = (cologneData as unknown as Array<District>).find(
            (dist) => dist.Stadtteil_ID === cologneDistrict
          )!.Population_rel;
          // loop thru results
          data.results = data.results.map(({compartments, day, name}) => {
            Object.keys(compartments).forEach((compName) => {
              compartments[compName] *= weight;
            });
            return {compartments, day, name};
          });
        }
        /* [CDtemp-end] */

        return {data: data};
      },
    }),
  }),
});

/**
 * Represents the structure of a post filter.
 */
export interface PostFilter {
  /** The unique identifier. */
  id: number;

  /** The node associated. */
  node: string;

  /** The group filter associated. */
  groupFilter: GroupFilter;

  /** The day associated. Optional. */
  day?: string;

  /** The compartment associated. Optional. */
  compartment?: string;
}

/**
 * Represents the structure of multiple post filters.
 */
export interface PostFilters {
  /** The array of unique identifiers. */
  ids: number[];

  /** The node associated */
  node: string;

  /** The dictionary of group filters associated */
  groupFilterList: Dictionary<GroupFilter> | undefined;

  /** The day associated. Optional. */
  day?: string;

  /** The compartment associated. Optional. */
  compartment?: string;
}

/**
 * Represents the structure of a group category.
 */
export interface GroupCategory {
  /** The key of the group category. */
  key: string;

  /** The name of the group category. */
  name: string;

  /** The description of the group category. */
  description: string;
}

/**
 * Represents the structure of multiple group categories.
 */
export interface GroupCategories {
  /** The count of group categories. */
  count: number;

  /** The next group category. Null if there is no next group category. */
  next: null;

  /** The previous group category. Null if there is no previous group category. */
  previous: null;

  /** The array of group categories. */
  results: Array<GroupCategory>;
}

/**
 * Represents the structure of a group subcategory.
 */
export interface GroupSubcategory {
  /** The key of the group subcategory. */
  key: string;

  /** The name of the group subcategory. */
  name: string;

  /** The description of the group subcategory. */
  description: string;

  /** The category of the group subcategory. */
  category: string;
}

/**
 * Represents the structure of multiple group subcategories.
 */
export interface GroupSubcategories {
  /** The count of group subcategories. */
  count: number;

  /** The next group subcategory. Null if there is no next group subcategory. */
  next: null;

  /** The previous group subcategory. Null if there is no previous group subcategory. */
  previous: null;

  /** The array of group subcategories. */
  results: Array<GroupSubcategory>;
}

export const {
  useGetGroupCategoriesQuery,
  useGetGroupSubcategoriesQuery,
  useGetSingleGroupFilterDataQuery,
  useGetMultipleGroupFilterDataLineChartQuery,
  useGetMultipleGroupFilterDataQuery,
} = groupApi;
