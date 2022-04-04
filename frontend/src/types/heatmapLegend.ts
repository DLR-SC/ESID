export interface HeatmapLegend {
  name: string;
  isNormalized: boolean;
  steps: {
    color: string;
    value: number;
  }[];
}