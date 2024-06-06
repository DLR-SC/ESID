export interface Localization {
  formatNumber?: (value: number) => string;
  customLang?: string;
  overrides?: {
    [key: string]: string;
  };
}
