import {Dictionary} from 'util/util';

export interface RKIDistrictQueryResult {
  count: number;
  next: string | null;
  previous: string | null;
  results: Array<Dictionary<number | string>>;
}

export interface RKIDateQueryResult {
  count: number;
  next: string | null;
  previous: string | null;
  results: Array<RKIDateQueryDistrictEntry>;
}

export interface RKIDateQueryDistrictEntry {
  node: string;
  compartments: Dictionary<number>;
}
