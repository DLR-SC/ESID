import {Dictionary} from 'util/util';

export interface RKIDataByNode {
  count: number;
  next: string | null;
  previous: string | null;
  results: Array<{day: string, compartments: Dictionary<number>}>;
}

export interface RKIDataByDate {
  count: number;
  next: string | null;
  previous: string | null;
  results: Array<{node: string, compartments: Dictionary<number>}>;
}