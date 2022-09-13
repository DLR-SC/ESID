import {Dictionary} from 'util/util';

export interface groupResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Array<{compartments: Dictionary<number>; day: string; name: string}>;
}

export interface groupData {
  compartments: Dictionary<number>;
  day: string;
  name: string;
}

export interface groupDataSelection {
  name: string;
  data: groupData[];
}
