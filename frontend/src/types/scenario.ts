import {Dictionary} from 'util/util';

export interface SimulationModels {
  count: number;
  previous: string | null;
  next: string | null;
  results: Array<{url: string; name: string}>;
}

export interface SimulationModel {
  name: string;
  description: string;
  parameters: Array<string>;
  compartments: Array<string>;
}

export interface Simulations {
  count: number;
  previous: string | null;
  next: string | null;
  results: Array<SimulationMetaData>;
}

export interface SimulationMetaData {
  id: number;
  name: string;
  description: string;
  startDay: string;
  numberOfDays: number;
  scenario: string;
  percentiles: Array<number>;
}

export interface SimulationDataByDate {
  count: number;
  previous: string | null;
  next: string | null;
  results: Array<{name: string; compartments: Dictionary<number>}>;
}

export interface SimulationDataByNode {
  count: number;
  previous: string | null;
  next: string | null;
  results: Array<{day: string; compartments: Dictionary<number>}>;
}
