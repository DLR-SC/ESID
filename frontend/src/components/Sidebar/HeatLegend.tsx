import React, {useEffect} from 'react';
import {Box} from '@mui/material';
import * as am5 from '@amcharts/amcharts5';

interface IHeatmapLegendItem {
  color: string;
  value: number;
}

export default function HeatLegend(props: {
  // add is_dynamic/absolute?
  legend: IHeatmapLegendItem[];
  exposeLegend: (legend: am5.HeatLegend | null) => void;
  min: number;
  max: number;
}): JSX.Element {
  useEffect(() => {
    const root = am5.Root.new('legend');
    const heatLegend = root.container.children.push(
      am5.HeatLegend.new(root, {
        orientation: 'horizontal',
        startValue: props.min,
        startColor: am5.color(props.legend[0].color),
        endValue: props.max,
        endColor: am5.color(props.legend[props.legend.length - 1].color),
      })
    );

    // compile stop list
    const stoplist: {color: am5.Color; opacity: number; offset: number}[] = [];
    props.legend.forEach((item) => {
      stoplist.push({
        color: am5.color(item.color),
        // opacity of the color between 0..1
        opacity: 1,
        // offset is stop position normalized to 0..1
        offset: (item.value - props.min) / (props.max - props.min),
      });
    });
    heatLegend.markers.template.adapters.add('fillGradient', (gradient) => {
      gradient?.set('stops', stoplist);
      return gradient;
    });

    // expose Legend element to District map (for tooltip on event)
    props.exposeLegend(heatLegend);

    return () => {
      root.dispose();
      props.exposeLegend(null);
    };
  }, [props]);

  return (
    <Box
      id='legend'
      sx={{
        margin: '5px',
        height: '50px',
      }}
    />
  );
}
