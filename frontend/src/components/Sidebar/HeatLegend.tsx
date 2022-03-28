import React, {useEffect} from 'react';
import {useTheme} from '@mui/material/styles';
import {Box} from '@mui/material';
import * as am5 from '@amcharts/amcharts5';
import {useTranslation} from 'react-i18next';
import {NumberFormatter} from 'util/hooks';

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
  isNormalized: boolean;
}): JSX.Element {
  const {i18n: i18n} = useTranslation();
  const {formatNumber} = NumberFormatter(i18n.language, 3, 8);
  const theme = useTheme();

  useEffect(() => {
    const root = am5.Root.new('legend');
    const heatLegend = root.container.children.push(
      am5.HeatLegend.new(root, {
        orientation: 'horizontal',
        startValue: props.min,
        startText: formatNumber(props.min),
        endValue: props.max,
        endText: formatNumber(props.max),
        // set start & end color to paper background as gradient is overwritten later and this sets the tooltip background color
        startColor: am5.color(theme.palette.background.paper),
        endColor: am5.color(theme.palette.background.paper),
      })
    );

    // compile stop list
    const stoplist: {color: am5.Color; opacity: number; offset: number}[] = [];
    props.legend.forEach((item) => {
      stoplist.push({
        color: am5.color(item.color),
        // opacity of the color between 0..1
        opacity: 1,
        // offset is stop position normalized to 0..1 unless already nomalized
        offset: props.isNormalized ? item.value : (item.value - props.min) / (props.max - props.min),
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
  }, [props, formatNumber, theme]);

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
