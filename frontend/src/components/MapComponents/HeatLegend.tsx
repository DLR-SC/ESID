import {useEffect} from 'react';
import * as am5 from '@amcharts/amcharts5';
import {Box} from '@mui/material';
import React from 'react';
import {HeatmapLegend} from 'types/heatmapLegend';

interface HeatProps {
  legend: HeatmapLegend;
  exposeLegend: (legend: am5.HeatLegend | null) => void;
  min: number;
  max: number;
  displayText: boolean;
  id: string;
  tooltipStartColor?: string;
  tooltipEndColor?: string;
  style?: React.CSSProperties;
  formatNumber: (value: number) => string;
}

export default function HeatLegend({
  legend,
  exposeLegend,
  min,
  max,
  displayText,
  id,
  tooltipStartColor = '#F8F8F9',
  tooltipEndColor = '#F8F8F9',
  style = {
    width: '100%',
    margin: '5px',
    height: '50px',
  },
  formatNumber,
}: HeatProps) {
  const unique_id = id + String(Date.now() + Math.random());

  useEffect(() => {
    const root = am5.Root.new(unique_id);
    const heatLegend = root.container.children.push(
      am5.HeatLegend.new(root, {
        orientation: 'horizontal',
        startValue: min,
        startText: displayText ? formatNumber(min) : ' ',
        endValue: max,
        endText: displayText ? formatNumber(max) : ' ',
        // set start & end color to paper background as gradient is overwritten later and this sets the tooltip background color
        startColor: am5.color(tooltipStartColor),
        endColor: am5.color(tooltipEndColor),
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
    
  }, [displayText, formatNumber, legend.isNormalized, legend.steps, max, min, tooltipEndColor, tooltipStartColor]);

  return <Box id={unique_id} sx={style} />;
}
