// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

export interface Localization {
  formatNumber?: (value: number) => string;
  customLang?: string;
  overrides?: {
    [key: string]: string;
  };
}
