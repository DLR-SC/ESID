// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {Dictionary} from 'util/util';

/**
 * Represents the response object returned from the server when fetching filtered information.
 */
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

/**
 * Represents the structure of a filter group.
 */
export interface GroupFilter {
  /** The unique identifier of the filter group. */
  id: string;

  /** The display name of the filter group. */
  name: string;

  /** Indicates whether the filter group is visible. */
  isVisible: boolean;

  /** The dictionary of field selecte in the editor that it will be used to filter the info */
  groups: Dictionary<string[]>;
}
