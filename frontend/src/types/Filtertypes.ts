import {Dictionary} from './Cardtypes';

export interface GroupFilter {
  id: string;
  name: string;
  isVisible: boolean;
  groups: Dictionary<string[]>;
}

export interface GroupCategories {
  count: number;
  next: null;
  previous: null;
  results: {
    key: string;
    name: string;
    description: string;
  }[];
}

export interface GroupSubcategories {
  count: number;
  next: null;
  previous: null;
  results: {
    key: string;
    name: string;
    description: string;
    category: string;
  }[];
}
