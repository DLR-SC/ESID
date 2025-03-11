import { AGS } from "store/DataSelectionSlice";

export type PopulationValueModeType = 'absolute' | 'proportional';

export interface PopulationData {
  id: string;
  name: string;
  total_population: number | '-';
  population_relative?: number;
}

export type UnavailableAGS = Array<AGS> | [] ;

