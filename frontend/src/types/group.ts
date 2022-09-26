import {Dictionary} from 'util/util';

export interface groupResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Array<groupData>;
}

export interface groupData {
  compartments: Dictionary<number>;
  day: string;
  name: string;
}

export interface filter {
  name: string;
  toggle: boolean | null;
  groups: Dictionary<string[]>;
}
