// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {useCallback, useLayoutEffect, useMemo} from 'react';
import * as am5 from '@amcharts/amcharts5';
import {Box} from '@mui/material';
import React from 'react';
import {HeatmapLegend} from 'types/heatmapLegend';
import {useTheme} from '@mui/material/styles';
import {Localization} from 'types/localization';
import useRoot from 'components/shared/Root';
import useHeatLegend from 'components/shared/HeatMap/Legend';

interface HeatProps {
  /**
   * Object defining the legend for the heatmap.
   * Includes the steps and normalization settings for the legend.
   */
  legend: HeatmapLegend;

  /**
   * Optional callback function to expose the legend object (an instance of `am5.HeatLegend`).
   * This can be used to interact with the legend outside of the component.
   */
  exposeLegend?: (legend: am5.HeatLegend | null) => void;

  /**
   * The minimum value represented on the heatmap. This value is used as the start value for the legend.
   */
  min: number;

  /**
   * The maximum value represented on the heatmap. This value is used as the end value for the legend.
   */
  max: number;

  /**
   * Boolean flag indicating whether to display text labels for the start and end values on the legend.
   */
  displayText: boolean;

  /**
   * Optional unique identifier for the legend. Defaults to 'legend'.
   */
  id?: string;

  /**
   * Optional CSS properties to style the legend container.
   * Defaults to width: '100%', margin: '5px', height: '50px'.
   */
  style?: React.CSSProperties;

  /**
   * Optional localization settings for the legend.
   */
  localization?: Localization;
}

/**
 * React Component to render a Legend for a Heatmap.
 * @returns {JSX.Element} JSX Element to render the Heatmap Legend.
 */
export default function HeatLegend({
  legend,
  exposeLegend = () => {},
  min,
  max,
  displayText,
  id = 'legend',
  style = {
    width: '100%',
    margin: '5px',
    height: '50px',
  },
  localization,
}: Readonly<HeatProps>): JSX.Element {
  const unique_id = useMemo(() => id + String(Date.now() + Math.random()), [id]);
  const theme = useTheme();

  const root = useRoot(unique_id);

  // Memoize the default localization object to avoid infinite re-renders
  const defaultLocalization = useMemo(() => {
    return {
      formatNumber: (value: number) => value.toString(),
      customLang: 'global',
      overrides: {},
    };
  }, []);

  // Use the provided localization or default to the memoized one
  const localizationToUse = localization || defaultLocalization;

  const heatLegendSettings = useMemo(() => {
    return {
      orientation: 'horizontal' as 'horizontal' | 'vertical',
      startValue: min,
      startText: displayText ? localizationToUse.formatNumber!(min) : ' ',
      endValue: max,
      endText: displayText ? localizationToUse.formatNumber!(max) : ' ',
      // set start & end color to paper background as gradient is overwritten later and this sets the tooltip background color
      startColor: am5.color(theme.palette.background.paper),
      endColor: am5.color(theme.palette.background.paper),
    };
  }, [min, displayText, localizationToUse.formatNumber, max, theme.palette.background.paper]);

  const stoplist = useMemo(() => {
    return legend.steps.map((item) => ({
      color: am5.color(item.color),
      opacity: 1,
      offset: legend.isNormalized ? item.value : (item.value - min) / (max - min),
    }));
  }, [legend, min, max]);

  const heatLegend = useHeatLegend(
    root,
    heatLegendSettings,
    useCallback(
      (legend: am5.HeatLegend) => {
        legend.markers.template.adapters.add('fillGradient', (gradient) => {
          gradient?.set('stops', stoplist);
          return gradient;
        });
      },
      [stoplist]
    )
  );

  // This effect is used to expose the legend object to the parent component
  useLayoutEffect(() => {
    if (!heatLegend) {
      return;
    }
    // expose Legend element to District map (for tooltip on event)
    exposeLegend(heatLegend);

    return () => {
      exposeLegend(null);
    };
    // This effect should only run when the legend object changes
  }, [heatLegend, legend, min, max, exposeLegend]);

  return <Box id={unique_id} sx={style} />;
}
