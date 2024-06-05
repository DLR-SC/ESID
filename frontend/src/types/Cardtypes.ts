export interface Dictionary<T> {
  [key: string]: T;
}

export interface Scenario {
  id: number;
  label: string;
}

export const initialState = {
  scenarios: [] as Scenario[],
  compartments: [] as string[],
};

export interface cardValue {
  compartmentValues: Dictionary<number> | null;
  startValues: Dictionary<number> | null;
}

export interface filterValue {
  filteredTitle: string;
  filteredValues: Dictionary<number> | null;
}
