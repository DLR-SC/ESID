// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR) and CISPA Helmholtz Center for Information Security
// SPDX-License-Identifier: Apache-2.0

export interface RealmRepresentation {
  realm: string;
  id?: string;
  displayName?: string;
  displayNameHtml?: string;
  enabled?: boolean;
}
