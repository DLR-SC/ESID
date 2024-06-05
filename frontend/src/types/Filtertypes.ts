// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

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
