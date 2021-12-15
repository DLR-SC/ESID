export interface RKIDistrictQueryResult {
  county: string;
  count: number;
  data: Array<RKIDistrictEntry>;
}

export interface RKIDistrictEntry {
  date: string;
  infectious: number;
  deaths: number;
  recovered: number;
  timestamp: number;
}

export interface RKIDateQueryResult {
  day: string;
  count: number;
  data: Array<RKIDateEntry>;
}

export interface RKIDateEntry {
  county: string;
  infectious: number;
  deaths: number;
  recovered: number;
}
