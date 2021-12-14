interface RKIDistrictQuery {
  county: string;
  count: number;
  data: Array<RKIDistrictEntryResult>;
}

interface RKIDistrictEntryResult {
  date: string;
  infectious: number;
  deaths: number;
  recovered: number;
  timestamp: number;
}

interface RKIDateQueryResult {
  day: string;
  count: number;
  data: Array<RKIDateEntry>;
}

interface RKIDateEntry {
  county: string;
  infectious: number;
  deaths: number;
  recovered: number;
}
