import {Color} from '@amcharts/amcharts5/.internal/core/util/Color';

export interface LineChartData {
  values: {day: string; value: number}[];
  name: string;
  serieId: string | number;
  valueYField: string | number;
  tooltipText?: string;
  stroke: {
    color: Color;
    strokeWidth?: number;
    strokeDasharray?: number[];
  };
}
