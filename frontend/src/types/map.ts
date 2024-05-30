export interface Feature {
  type: string;
  geometry: {
    type: string;
    coordinates: number[];
  };
  properties: {
    [key: string]: string | number;
  };
  id?: string | number;
}
export interface FeatureCollection {
  type: string;
  features: Feature[];
}

export interface FeatureProperties {
  [key: string]: string | number;
}
