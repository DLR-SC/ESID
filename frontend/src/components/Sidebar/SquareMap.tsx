import React, {useEffect, useState, useRef} from 'react';
import * as am5 from '@amcharts/amcharts5';
import {Box} from '@mui/material';
import {useTheme} from '@mui/material/styles';

interface IRegion {
  position: [number, number];
  RS: string;
  GEN: string;
  BEZ: string;
}

export default function SquareMap(): JSX.Element {
  const [data, setData] = useState<IRegion[][]>();
  const rootRef = useRef<am5.Root | null>(null);

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
          setData(json);
        },
        // reject promise
        () => {
          console.warn('Failed to fetch JSON');
        }
      );
  }, []);

  useEffect(() => {
    const root = am5.Root.new('squaresdiv');

    const outer = root.container.children.push(
      am5.Container.new(root, {
        width: am5.percent(200),
        height: am5.percent(200),
        x: am5.percent(-50),
        y: am5.percent(-50),
        interactive: true,
        wheelable: true,
        draggable: true,
        background: am5.Rectangle.new(root, {
          stroke: am5.color(theme.palette.secondary.light),
          strokeWidth: 1,
          fill: am5.color(theme.palette.background.default),
        }),
      })
    );

    const chart = outer.children.push(
      am5.Container.new(root, {
        width: am5.percent(50),
        height: am5.percent(50),
        x: am5.percent(25),
        y: am5.percent(25),
      })
    );
    let bg;
    const size = chart.width() / (data?.[0].length ?? 1);

    data?.forEach((row, y) => {
      row.forEach((district, x) => {
        const container = am5.Container.new(root, {
          width: size,
          height: size,
          background: (bg = am5.Rectangle.new(root, {
            stroke: am5.color(theme.palette.background.default),
            strokeWidth: 1,
            fill: am5.color(theme.palette.info.light),
            tooltipText: district.GEN + '  ' + district.RS,
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
        if (data[y][x + 1] && district.RS.slice(0, 2) != data[y][x + 1].RS.slice(0, 2)) {
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
        if (data[y + 1] && district.RS.slice(0, 2) != data[y + 1][x].RS.slice(0, 2)) {
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

    //TODO limit drag

    // outer.events.on('dragged', (ev) => {
    //   console.log(ev.target.x());
    //   console.log(ev);
    // });

    outer.events.on('wheel', (ev) => {
      const zoomMultiplier = 1.25;
      const zoomOutLimit = 0.75;
      const zoomInLimit = 3.0;

      const prevScale = outer.get('scale', 1);
      // check in which direction the wheel was moved
      let newScale = ev.originalEvent.deltaY > 0 ? prevScale / zoomMultiplier : prevScale * zoomMultiplier;
      // keep scale beetween limits
      newScale = Math.max(zoomOutLimit, Math.min(zoomInLimit, newScale));

      console.log(`newScale: ${newScale}`);
      if (newScale != prevScale) {
        const prevX = outer.x();
        const prevY = outer.y();

        const newX = prevX + (ev.point.x - prevX) * (1 - newScale / prevScale);
        const newY = prevY + (ev.point.y - prevY) * (1 - newScale / prevScale);
        outer.set('x', newX);
        outer.set('y', newY);
        outer.set('scale', newScale);
      }
    });

    rootRef.current = root;
    return () => {
      rootRef.current && rootRef.current.dispose();
    };
  }, [data, theme]);
  return <Box id='squaresdiv' height={'650px'} />;
}
