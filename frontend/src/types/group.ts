// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

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
