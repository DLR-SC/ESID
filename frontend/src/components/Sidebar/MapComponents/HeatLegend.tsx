// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {useLayoutEffect, useMemo} from 'react';
import * as am5 from '@amcharts/amcharts5';
import {Box} from '@mui/material';
import React from 'react';
import {HeatmapLegend} from 'types/heatmapLegend';
import {useTheme} from '@mui/material/styles';
import {Localization} from 'types/localization';

interface HeatProps {
  legend: HeatmapLegend;
  exposeLegend: (legend: am5.HeatLegend | null) => void;
  min: number;
  max: number;
  displayText: boolean;
  id: string;
  style?: React.CSSProperties;
  localization?: Localization;
}

export default function HeatLegend({
  legend,
  exposeLegend,
  min,
  max,
  displayText,
  id,
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
}: Readonly<HeatProps>) {
  const unique_id = useMemo(() => id + String(Date.now() + Math.random()), [id]);
  const theme = useTheme();

  useLayoutEffect(() => {
    const root = am5.Root.new(unique_id);
    const heatLegend = root.container.children.push(
      am5.HeatLegend.new(root, {
        orientation: 'horizontal',
        startValue: min,
        startText: displayText ? localization.formatNumber!(min) : ' ',
        endValue: max,
        endText: displayText ? localization.formatNumber!(max) : ' ',
        // set start & end color to paper background as gradient is overwritten later and this sets the tooltip background color
        startColor: am5.color(theme.palette.background.paper),
        endColor: am5.color(theme.palette.background.paper),
      })
    );

    // compile stop list
    const stoplist: {color: am5.Color; opacity: number; offset: number}[] = [];
    legend.steps.forEach((item) => {
      stoplist.push({
        color: am5.color(item.color),
        // opacity of the color between 0..1
        opacity: 1,
        // offset is stop position normalized to 0..1 unless already normalized
        offset: legend.isNormalized ? item.value : (item.value - min) / (max - min),
      });
    });
    heatLegend.markers.template.adapters.add('fillGradient', (gradient) => {
      gradient?.set('stops', stoplist);
      return gradient;
    });

    // expose Legend element to District map (for tooltip on event)
    exposeLegend(heatLegend);

    return () => {
      root.dispose();
      exposeLegend(null);
    };
  }, [
    displayText,
    exposeLegend,
    localization.formatNumber,
    legend.isNormalized,
    legend.steps,
    max,
    min,
    theme.palette.background.paper,
    unique_id,
    localization,
  ]);

  return <Box id={unique_id} sx={style} />;
}
