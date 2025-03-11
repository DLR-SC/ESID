// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {District} from 'types/cologneDistricts';
import {PopulationData} from 'types/populationValueMode';
import { SimulationDataByNode } from 'types/scenario';

/**
 * Makes a deep copy of the supplied object.
 * @param obj
 */
export function deepCopy<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj)) as T;
}

/**
 * Converts the given Date to a string following the ISO-Format YYYY-MM-DD.
 * @param date Either a Date object or milliseconds since the Unix-Epoch.
 * @return The date in the ISO-Format: YYYY-MM-DD
 */
export function dateToISOString(date: Date | number): string {
  if (typeof date === 'number') {
    date = new Date(date);
  }

  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Converts a hexadecimal color code to an RGB color code.
 * @param hex - The hexadecimal color code to convert.
 * @param alpha - The alpha value for the RGB color code (optional).
 * @returns The RGB color code.
 */
export function hexToRGB(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16),
    g = parseInt(hex.slice(3, 5), 16),
    b = parseInt(hex.slice(5, 7), 16);

  if (alpha) {
    return 'rgba(' + r.toString() + ', ' + g.toString() + ', ' + b.toString() + ', ' + alpha.toString() + ')';
  } else {
    return 'rgb(' + r.toString() + ', ' + g.toString() + ', ' + b.toString() + ')';
  }
}

/**
 * This is a type that can be used to describe object maps with a clear key/value structure. E.g:
 * const ages: Dictionary<number> = {
 *   Aragorn: 87,
 *   Arwen: 2901,
 *   Bilbo: 129,
 *   Boromir: 41,
 *   Elrond: 6518,
 *   Frodo: 51,
 *   Galadriel: 7000,
 *   Gimli: 140,
 *   Gollum: 589,
 *   Legolas: 2931,
 *   Merry: 37,
 *   Pippin: 29,
 *   Samwise: 39
 * }
 */
export interface Dictionary<T> {
  [key: string]: T;
}

interface MapData {
  id: string;
  value: number;
}
/**
 * Calculates the proportional value per a given unit population.
 *
 * @param value - The initial value from map data.
 * @param totalPopulation - The total population for the matching region.
 * @param perCapitaUnit - The population unit to scale the value to (default is 100,000).
 * @returns The calculated proportional value.
 */
export const calculateProportionalValue = (
  value: number,
  totalPopulation: number,
  perCapitaUnit: number = 100000
): number => {
  return (value / totalPopulation) * perCapitaUnit;
};

/**
 * Converts map data values to proportional values per 100,000 population.
 *
 * @param mapData - Initial map data with `id` and `value`.
 * @param populationData - Population data with `id`, `name`, and `total_population`.
 * @returns An object containing:
 *   - `matchedMapData`: Updated map data with proportional values.
 *   - `unmatchedIDs`: List of `id`s without a matching valid population entry.
 */
export const convertToProportionalValues = (
  mapData: MapData[],
  populationData: PopulationData[]
): {matchedMapData: MapData[]; unmatchedIDs: string[]} => {
  if (!mapData || !populationData) {
    return {matchedMapData: mapData, unmatchedIDs: []};
  }

  const unmatchedIDs: string[] = [];
  const matchedMapData = mapData.map((mapItem) => {
    const matchingPopulationItem = populationData.find((popItem) => popItem.id === mapItem.id);

    if (matchingPopulationItem && typeof matchingPopulationItem.total_population === 'number') {
      const updatedValue = calculateProportionalValue(mapItem.value, matchingPopulationItem.total_population);
      return {...mapItem, value: updatedValue};
    } else {
      unmatchedIDs.push(mapItem.id);
    }

    return mapItem;
  });

  return {matchedMapData, unmatchedIDs};
};

export const getTotalPopulationById = (populationData: PopulationData[], id: string): number => {
  const totalPopulation = populationData.filter((item) => item.id == id)[0].total_population;
  if (typeof totalPopulation === 'number') {
    return totalPopulation;
  }
  return 0;
};

/**
 * Combines Cologne district data into the main population data array.
 *
 * @param populationDataJson - The original population data array.
 * @param searchbarCologneData - The Cologne-specific data array.
 * @returns A new array containing both the original population data and the converted Cologne data.
 */
export const combineCologneData = (
  populationDataJson: PopulationData[],
  searchbarCologneData: District[]
): PopulationData[] => {
  // Convert each Cologne record to match the PopulationData format
  const colognePopulationData: PopulationData[] = searchbarCologneData.map((item) => ({
    // Build the new id by prefixing "05315" to the Stadtteil_ID
    id: `05315${item.Stadtteil_ID}`,
    // Create the name in the format "Köln - {Stadtteil} {Stadtbezirk}"
    name: `Köln - ${item.Stadtteil} ${item.Stadtbezirk}`,
    // Map Population_abs to total_population
    total_population: item.Population_abs,
    // Also include Population_rel as provided
    population_relative: item.Population_rel,
  }));

  // Return the combined data
  return [...populationDataJson, ...colognePopulationData];
};

export const transformSimulationDataItem = (simData: SimulationDataByNode, totalPopulation:number) => {
  return {
    ...simData,
    results: simData.results.map((entry) => ({
      ...entry,
      compartments: Object.fromEntries(
        Object.entries(entry.compartments).map(([key, value]) => [
          key,
          calculateProportionalValue(value, totalPopulation),
        ])
      ),
    })),
  };
};

export const transformSimulationData = (data: SimulationDataByNode, totalPopulation: number) => {
  if (Array.isArray(data)) {
    return data.map((simData) => transformSimulationDataItem(simData, totalPopulation));
  }
  return transformSimulationDataItem(data, totalPopulation);
}
