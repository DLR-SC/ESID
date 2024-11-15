// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {SimulationDataByNode} from '../../types/scenario';

/* [CDtemp-begin] */

/** Checks if input node is a city district and returns the node to fetch data, and the city distrct suffix if there is one */
export function validateDistrictNode(inNode: string): {node: string; cologneDistrict?: string} {
  if (inNode.length > 5) {
    return {node: inNode.slice(0, 5), cologneDistrict: inNode.slice(-3)};
  }
  return {node: inNode.slice(0, 5)};
}

import {District} from 'types/cologneDistricts';
import cologneData from '../../../assets/stadtteile_cologne_list.json';

/** Applies the city district weight if a district suffix is supplied */
export function modifyDistrictResults(
  cologneDistrict: string | undefined,
  data: SimulationDataByNode
): SimulationDataByNode {
  // pass data if it is not for a city district
  if (!cologneDistrict) return data;

  // find weight for city district
  const weight = (cologneData as unknown as Array<District>).find(
    (dist) => dist.Stadtteil_ID === cologneDistrict
  )!.Population_rel;

  // loop thru days in data to replace compartment data
  data.results = data.results.map(({day, compartments}) => {
    // loop through compartments and apply weight
    Object.keys(compartments).forEach((compName) => {
      compartments[compName] *= weight;
    });
    return {day, compartments};
  });
  // return modified data
  return data;
}

/* [CDtemp-end] */
