import React, {useEffect, useState, useRef} from 'react';
import * as am5 from '@amcharts/amcharts5';
import {Box} from '@mui/material';
import {useTheme} from '@mui/material/styles';
import {useAppSelector} from '../../store/hooks';
import {useGetMultipleSimulationDataByDateQuery} from '../../store/services/scenarioApi';

interface IRegion {
  position: [number, number];
  RS: string;
  GEN: string;
  BEZ: string;
}

export default function SquareMap(): JSX.Element {
  const selectedCompartment = useAppSelector((state) => state.dataSelection.compartment);
  const selectedDate = useAppSelector((state) => state.dataSelection.date);
  const scenarioList = useAppSelector((state) => state.scenarioList.scenarios);

  const {data, isFetching} = useGetMultipleSimulationDataByDateQuery(
    {
      ids: Object.entries(scenarioList).map(([, scenario]) => {
        return scenario.id;
      }),
      day: selectedDate ?? '',
      node: '',
      group: 'total',
      compartments: [selectedCompartment ?? ''],
    },
    {skip: !scenarioList || !selectedCompartment || !selectedDate}
  );

  const [positionData, setPositionData] = useState<IRegion[][]>();
  const rootRef = useRef<am5.Root | null>(null);
  const chartRef = useRef<am5.Container | null>(null);
  const theme = useTheme();

  // fetch json
  useEffect(() => {
    fetch('assets/dgrid_changed.json', {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })
      .then((response) => response.json())
      .then(
        // resolve Promise
        (json: IRegion[][]) => {
          setPositionData(json);
        },
        // reject promise
        () => {
          console.warn('Failed to fetch JSON');
        }
      );
  }, []);

  useEffect(() => {
    const root = am5.Root.new('squaresdiv');

    const interactiveContainer = root.container.children.push(
      am5.Container.new(root, {
        width: am5.percent(200),
        height: am5.percent(200),
        x: am5.percent(-50),
        y: am5.percent(-50),
        interactive: true,
        wheelable: true,
        draggable: true,
        background: am5.Rectangle.new(root, {
          fill: am5.color(theme.palette.background.default),
        }),
      })
    );

    const chart = interactiveContainer.children.push(
      am5.Container.new(root, {
        width: am5.percent(50),
        height: am5.percent(50),
        x: am5.percent(25),
        y: am5.percent(25),
      })
    );
    let bg;
    const size = chart.width() / (positionData?.[0].length ?? 1);

    positionData?.forEach((row, y) => {
      row.forEach((district, x) => {
        const container = am5.Container.new(root, {
          width: size,
          height: size,
          background: (bg = am5.Rectangle.new(root, {
            stroke: am5.color(theme.palette.background.default),
            strokeWidth: 1,
            fill: am5.color(theme.palette.info.light),
            tooltipText: district.GEN,
            tooltipPosition: 'fixed',
          })),
          x: x * size,
          y: y * size,
          userData: district.RS,
        });
        bg.states.create('hover', {
          stroke: am5.color(theme.palette.primary.main),
          strokeWidth: 2,
          layer: 2,
        });
        chart.children.push(container);

        // paint state borders
        if (positionData[y][x + 1] && district.RS.slice(0, 2) != positionData[y][x + 1].RS.slice(0, 2)) {
          chart.children.push(
            am5.Rectangle.new(root, {
              width: 2,
              height: size,
              fill: am5.color(theme.palette.secondary.dark),
              x: (x + 1) * size - 1,
              y: y * size,
              layer: 1,
            })
          );
        }
        if (positionData[y + 1] && district.RS.slice(0, 2) != positionData[y + 1][x].RS.slice(0, 2)) {
          chart.children.push(
            am5.Rectangle.new(root, {
              width: size,
              height: 2,
              fill: am5.color(theme.palette.secondary.dark),
              x: x * size,
              y: (y + 1) * size - 1,
              layer: 1,
            })
          );
        }
      });
    });

    interactiveContainer.events.on('dragged', () => {
      const xPos = interactiveContainer.x();
      const yPos = interactiveContainer.y();
      const xUpperLimit = root.width() - interactiveContainer.width() * interactiveContainer.get('scale', 1);
      const yUpperLimit = root.height() - interactiveContainer.height() * interactiveContainer.get('scale', 1);
      if (xPos > 0) {
        interactiveContainer.set('x', 0);
      }
      if (xPos < xUpperLimit) {
        interactiveContainer.set('x', xUpperLimit);
      }
      if (yPos > 0) {
        interactiveContainer.set('y', 0);
      }
      if (yPos < yUpperLimit) {
        interactiveContainer.set('y', yUpperLimit);
      }
    });

    interactiveContainer.events.on('wheel', (ev) => {
      const zoomMultiplier = 1.25;
      const zoomOutLimit = 0.75;
      const zoomInLimit = 3.0;

      const prevScale = interactiveContainer.get('scale', 1);
      // check in which direction the wheel was moved
      let newScale = ev.originalEvent.deltaY > 0 ? prevScale / zoomMultiplier : prevScale * zoomMultiplier;
      // keep scale beetween limits
      newScale = Math.max(zoomOutLimit, Math.min(zoomInLimit, newScale));

      if (newScale != prevScale) {
        const prevX = interactiveContainer.x();
        const prevY = interactiveContainer.y();

        const newX = prevX + (ev.point.x - prevX) * (1 - newScale / prevScale);
        const newY = prevY + (ev.point.y - prevY) * (1 - newScale / prevScale);
        interactiveContainer.set('x', newX);
        interactiveContainer.set('y', newY);
        interactiveContainer.set('scale', newScale);
      }
    });

    rootRef.current = root;
    chartRef.current = chart;
    return () => {
      rootRef.current && rootRef.current.dispose();
      chartRef.current && chartRef.current.dispose();
    };
  }, [positionData, theme]);

  useEffect(() => {
    if (!isFetching && data && selectedCompartment) {
      let max = 0;
      data.forEach((sim) => {
        sim.results?.forEach((v) => {
          if (v.name != '00000') {
            max = Math.max(max, v.compartments[selectedCompartment]);
          }
        });
      });
      if (chartRef.current) {
        const chart = chartRef.current;
        chart?.allChildren().forEach((child) => {
          const districtNumber = child.get('userData') as string;
          if (districtNumber && districtNumber.length == 5 && districtNumber != '00000') {
            const container = child as am5.Container;
            container.children.clear();
            Object.entries(scenarioList).forEach(([, scenario], simIndex) => {
              const dataPoint = data[scenario.id].results.find((el) => el.name == districtNumber);
              if (dataPoint && rootRef.current) {
                container.children.push(
                  am5.Rectangle.new(rootRef.current, {
                    width: am5.percent(100 / Object.entries(scenarioList).length),
                    height: am5.percent((dataPoint.compartments[selectedCompartment] / max) * 100),
                    x: am5.percent(simIndex * (100 / Object.entries(scenarioList).length)),
                    y: am5.percent(100 - (dataPoint.compartments[selectedCompartment] / max) * 100),
                    stroke: am5.color(theme.palette.background.default),
                    strokeWidth: 1,
                    fill: am5.color(theme.custom.scenarios[1][0]),
                    layer: 0, //should be under state borders but over hover (not possible with just layers bc. hover is over state borders); solution: change layer on hover
                  })
                );
              }
            });
          }
        });
      }
    }
  }, [data, isFetching, scenarioList, selectedCompartment, theme]);

  return <Box id='squaresdiv' height={'650px'} />;
}
