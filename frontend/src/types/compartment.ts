import {Dictionary} from 'util/util';

export interface CompartmentFilter {
  id: string;
  name: string;
  filter: string[];
  isVisible: boolean;
  compartments: Dictionary<string[]>;
}
