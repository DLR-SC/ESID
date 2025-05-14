// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

/**
 * Represents the Localization interface for providing translation and also formattation.
 */
export interface Localization {
  /**
   * A function that formats a number value as a string.
   * @param value - The number value to be formatted.
   * @returns The formatted number as a string.
   */
  formatNumber?: (value: number) => string;

  /**
   * A custom language string.
   */
  customLang?: string;

  /**
   * An object that contains key-value pairs for overriding specific localization strings.
   */
  overrides?: {
    [key: string]: string;
  };
}
