import {useState, useLayoutEffect} from 'react';
import {HeatLegend, IHeatLegendSettings} from '@amcharts/amcharts5';
import * as am5 from '@amcharts/amcharts5';
import {Root} from '@amcharts/amcharts5/.internal/core/Root';

export default function useHeatLegend(
  root: Root | null,
  settings: IHeatLegendSettings,
  stoplist: {color: am5.Color; opacity: number; offset: number}[],
  initializer?: (legend: HeatLegend) => void
): HeatLegend | null {
  const [legend, setLegend] = useState<HeatLegend>();

  useLayoutEffect(() => {
    if (!root) {
      return;
    }
    const newLegend = root.container.children.push(am5.HeatLegend.new(root, settings));

    newLegend.markers.template.adapters.add('fillGradient', (gradient) => {
      gradient?.set('stops', stoplist);
      return gradient;
    });

    setLegend(newLegend);

    if (initializer) {
      initializer(newLegend);
    }

    return () => {
      newLegend.dispose();
    };
  }, [root, settings, initializer, stoplist]);

  return legend ?? null;
}
