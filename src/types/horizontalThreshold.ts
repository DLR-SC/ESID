/**
 * Represents the horizontal threshold for a specific district and compartment.
 */
export interface HorizontalThreshold {
  /** The district for which the threshold applies (AGS). */
  district: string;

  /** The compartment for which the threshold applies. */
  compartment: string;

  /** The actual threshold value for the Y-axis. */
  threshold: number;
}
