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