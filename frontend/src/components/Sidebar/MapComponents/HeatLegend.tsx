// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {useLayoutEffect, useMemo} from 'react';
import * as am5 from '@amcharts/amcharts5';
import {Box} from '@mui/material';
import React from 'react';
import {HeatmapLegend} from 'types/heatmapLegend';
import {useTheme} from '@mui/material/styles';
import {Localization} from 'types/localization';
import useRoot from 'components/shared/map/Root';
import useHeatLegend from 'components/shared/map/legend';

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
   * Includes number formatting and language overrides.
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
  localization = {
    formatNumber: (value) => value.toLocaleString(),
    customLang: 'global',
    overrides: {},
  },
}: Readonly<HeatProps>): JSX.Element {
  const unique_id = useMemo(() => id + String(Date.now() + Math.random()), [id]);
  const theme = useTheme();

  const root = useRoot(unique_id);

  const heatLegendSettings = useMemo(() => {
    return {
      orientation: 'horizontal' as 'horizontal' | 'vertical',
      startValue: min,
      startText: displayText ? localization.formatNumber!(min) : ' ',
      endValue: max,
      endText: displayText ? localization.formatNumber!(max) : ' ',
      // set start & end color to paper background as gradient is overwritten later and this sets the tooltip background color
      startColor: am5.color(theme.palette.background.paper),
      endColor: am5.color(theme.palette.background.paper),
    };
  }, [min, max, displayText, localization.formatNumber, theme.palette.background.paper]);

  const stoplist = useMemo(() => {
    return legend.steps.map((item) => ({
      color: am5.color(item.color),
      opacity: 1,
      offset: legend.isNormalized ? item.value : (item.value - min) / (max - min),
    }));
  }, [legend, min, max]);

  const heatLegend = useHeatLegend(root, heatLegendSettings, stoplist);

  useLayoutEffect(() => {
    if (!heatLegend) {
      return;
    }
    // expose Legend element to District map (for tooltip on event)
    exposeLegend(heatLegend);

    return () => {
      exposeLegend(null);
    };
  }, [heatLegend, legend, min, max, exposeLegend]);

  return <Box id={unique_id} sx={style} />;
}
