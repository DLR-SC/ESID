import {Dictionary} from 'util/util';

export interface CaseDataByNode {
  count: number;
  next: string | null;
  previous: string | null;
  results: Array<{day: string; compartments: Dictionary<number>}>;
}

export interface CaseDataByDate {
  count: number;
  next: string | null;
  previous: string | null;
  results: Array<{name: string; compartments: Dictionary<number>}>;
}
