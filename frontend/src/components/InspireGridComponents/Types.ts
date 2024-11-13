// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

export interface LatLng {
  lat: number;
  lon: number;
}

export interface InspireGridCell {
  id: string;
  bounds: {
    min: LatLng;
    max: LatLng;
  };
  zone: number;
  level: number;
}
