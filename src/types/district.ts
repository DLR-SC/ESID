// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

/**
 * AGS is the abbreviation for "Amtlicher Gemeindeschlüssel" in German, which are IDs of areas in Germany. The AGS have
 * a structure to them that describes a hierarchy from a state level to a district level (and even smaller). Since we
 * are only interested in districts, our AGS are always of length 5. We dedicate the AGS of '00000' to the whole of
 * Germany, in case no AGS is selected.
 */
export type AGS = string;

/**
 * This interface describes a district in Germany. It contains the AGS, the name of the district and the type of the
 * district.
 */
export interface District {
  ags: AGS;
  name: string;
  type: string;
}
