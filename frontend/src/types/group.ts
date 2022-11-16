import {Dictionary} from 'util/util';

export interface GroupResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Array<GroupData>;
}

export interface GroupData {
  compartments: Dictionary<number>;
  day: string;
  name: string;
}

export interface GroupFilter {
  id: string;
  name: string;
  toggle: boolean;
  groups: Dictionary<string[]>;
}
