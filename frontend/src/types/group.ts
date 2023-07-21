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
  isVisible: boolean;
  groups: Dictionary<string[]>;
}
export interface CompartmentFilters {
  id: string;
  name: string;
  isVisible: boolean;
  groups: Dictionary<string[]>;
}
