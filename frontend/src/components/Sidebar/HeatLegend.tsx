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
  setLegend: () => IHeatmapLegendItem[];
  min: number;
  max: number;
}): JSX.Element {
  useEffect(() => {
    const root = am5.Root.new('legend');
    root.container.children.push(
      am5.HeatLegend.new(root, {
        orientation: 'horizontal',
        startValue: props.min,
        startColor: am5.color(props.legend[0].color),
        endValue: props.max,
        endColor: am5.color(props.legend[props.legend.length - 1].color),
      })
    );

    // TODO: overwrite gradient & figure out ticks

    return () => {
      root.dispose();
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
