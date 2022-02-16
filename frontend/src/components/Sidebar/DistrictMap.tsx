import React, {useState} from 'react';
import {useTheme} from '@mui/material/styles';
/* deprecated */ import * as am4core from '@amcharts/amcharts4/core';
/* deprecated */ import * as am4maps from '@amcharts/amcharts4/maps';
import * as am5 from '@amcharts/amcharts5';
import * as am5map from '@amcharts/amcharts5/map';
import {useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {useAppDispatch} from '../../store/hooks';
import {selectDistrict} from '../../store/DataSelectionSlice';
import {useAppSelector} from '../../store/hooks';
import {Box} from '@mui/material';
import {useGetSimulationDataByDateQuery} from 'store/services/scenarioApi';
import HeatLegend from './HeatLegend';

const {useRef} = React;

interface IRegionPolygon {
  value: number;

  /** District name */
  GEN: string;

  /** District type */
  BEZ: string;

  /** AGS (district ID) */
  RS: string;
}

interface IHeatmapLegendItem {
  color: string;
  value: number;
}

// Dummy Props for Heat Legend
const dummyLegend: IHeatmapLegendItem[] = [
  {color: '#00FF00', value: 0},
  {color: '#FFFF00', value: 35},
  {color: '#FFA500', value: 50},
  {color: '#FF0000', value: 100},
  {color: '#800080', value: 200},
];

/**
 * The Map component includes:
 * - A detailed Map of Germany
 * - Heat Legend container
 * - Zoom control
 * The colors depends on temporary values assigned to each region.
 */
export default function DistrictMap(): JSX.Element {
  const [geodata, setGeodata] = useState<GeoJSON.GeoJSON | null>(null);
  //const selectedDistrict = useAppSelector((state) => state.dataSelection.district);
  const selectedScenario = useAppSelector((state) => state.dataSelection.scenario);
  const selectedCompartment = useAppSelector((state) => state.dataSelection.compartment);
  const selectedDate = useAppSelector((state) => state.dataSelection.date);
  const scenarioList = useAppSelector((state) => state.scenarioList.scenarios);

  const {data} = useGetSimulationDataByDateQuery(
    {
      id: selectedScenario ?? 0,
      day: selectedDate ?? '',
      group: 'total',
      compartments: [selectedCompartment ?? ''],
    },
    {skip: !selectedScenario || !selectedCompartment || !selectedDate}
  );

  const chartRef = useRef<am5map.MapChart | null>(null);
  const rootRef = useRef<am5.Root | null>(null);
  const legendRef = useRef<am5.HeatLegend | null>(null);

  const {t} = useTranslation('global');
  const theme = useTheme();
  const dispatch = useAppDispatch();
  //const lastSelectedPolygon = useRef<am5map.MapPolygon | null>(null);

  // fetch geojson
  useEffect(() => {
    fetch('assets/lk_germany_reduced.geojson', {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })
      .then((response) => response.json())
      .then(
        // resolve Promise
        (geojson: GeoJSON.GeoJSON) => {
          setGeodata(geojson);
        },
        // reject promise
        () => {
          console.warn('Failed to fetch geoJSON');
        }
      );
  }, []);

  // Setup Map
  useEffect(() => {
    // Create map instance
    const root = am5.Root.new('mapdiv');
    const chart = root.container.children.push(
      am5map.MapChart.new(root, {
        projection: am5map.geoMercator(),
        zoomControl: am5map.ZoomControl.new(root, {
          paddingBottom: 25,
          opacity: 50,
        }),
      })
    );
    dispatch(selectDistrict({ags: '00000', name: t('germany'), type: ''}));

    // Create polygon series
    const polygonSeries = chart.series.push(
      am5map.MapPolygonSeries.new(root, {
        geoJSON: geodata ?? undefined,
        tooltipPosition: 'fixed',
      })
    );
    // get template for polygons to attach events etc to each
    const polygonTemplate = polygonSeries.mapPolygons.template;
    polygonTemplate.setAll({
      stroke: am5.color(theme.palette.divider),
      strokeWidth: 1,
    });
    // add click event
    polygonTemplate.events.on('click', (e) => {
      const item = e.target.dataItem?.dataContext as IRegionPolygon;
      dispatch(selectDistrict({ags: item.RS, name: item.GEN, type: t(item.BEZ)}));
    });
    // add hover state
    polygonTemplate.states.create('hover', {
      stroke: am5.color(theme.palette.primary.main),
      strokeWidth: 2,
    });
    // pull polygon to front on hover (to fix other polygons omitting outline)
    polygonTemplate.events.on('pointerover', (e) => {
      e.target.toFront();
      if (legendRef.current) {
        legendRef.current.showValue((e.target.dataItem?.dataContext as IRegionPolygon).value);
      }
    });

    rootRef.current = root;
    chartRef.current = chart;
    return () => {
      chartRef.current && chartRef.current.dispose();
      rootRef.current && rootRef.current.dispose();
    };
  }, [geodata, theme, t, dispatch]);

  // TODO: district search for highlighting
  /*
  useEffect(() => {
    // unselect previous
    if (chartRef.current && lastSelectedPolygon.current) {
      // reset style
      lastSelectedPolygon.current.setAll({
        stroke: am5.color(theme.palette.background.default),
        strokeWidth: 1,
        showTooltipOn: 'hover',
      });
    }
    if (chartRef.current && chartRef.current.series.length > 0) {
      const series = chartRef.current.series.getIndex(0) as am5map.MapPolygonSeries;
      series.mapPolygons.each((polygon) => {
        // TODO: change this to a map lookup?
        const data = polygon.dataItem?.dataContext as IRegionPolygon;
        if (data.RS === selectedDistrict.ags) {
          // pull to front (z-level)
          polygon.toFront();
          // apply hover style
          polygon.setAll({
            stroke: am5.color(theme.palette.primary.main),
            strokeWidth: 2,
            showTooltipOn: 'always',
          });
          // save polygon
          lastSelectedPolygon.current = polygon;
        }
      });
    }
  }, [selectedDistrict]);*/

  // Heat Legend TODO: review new heat legends & redo this
  useEffect(() => {
    if (chartRef.current && rootRef.current) {
      rootRef.current.container.children.push(
        am5.HeatLegend.new(rootRef.current, {
          orientation: 'horizontal',
          startValue: dummyLegend[0].value,
          startColor: am5.color(dummyLegend[0].color),
          endValue: dummyLegend[dummyLegend.length - 1].value,
          endColor: am5.color(dummyLegend[dummyLegend.length - 1].color),
        })
      );
    }

    const legendContainer4 = am4core.create('legenddiv', am4core.Container);
    legendContainer4.width = am4core.percent(100);
    const heatLegend4 = legendContainer4.createChild(am4maps.HeatLegend);
    heatLegend4.valign = 'bottom';
    heatLegend4.orientation = 'horizontal';
    heatLegend4.height = am4core.percent(20);
    heatLegend4.minValue = dummyLegend[0].value;
    heatLegend4.maxValue = dummyLegend[dummyLegend.length - 1].value;
    heatLegend4.minColor = am4core.color('#F2F2F2');
    heatLegend4.maxColor = am4core.color('#F2F2F2');
    heatLegend4.align = 'center';

    // override heatLegend gradient
    // function to normalize stop to 0..1 for gradient
    const normalize = (x: number): number => {
      return (x - dummyLegend[0].value) / (dummyLegend[dummyLegend.length - 1].value - dummyLegend[0].value);
    };
    // create new gradient and add color for each item in props, then add it to heatLegend to override
    const gradient4 = new am4core.LinearGradient();
    dummyLegend.forEach((item) => {
      gradient4.addColor(am4core.color(item.color), 1, normalize(item.value));
    });
    heatLegend4.markers.template.adapter.add('fill', () => gradient4);

    // resize and pack axis labels
    heatLegend4.valueAxis.renderer.labels.template.fontSize = 9;
    heatLegend4.valueAxis.renderer.minGridDistance = 20;
  }, []);

  // Polygon
  useEffect(() => {
    if (chartRef.current && chartRef.current.series.length > 0) {
      const polygonSeries = chartRef.current.series.getIndex(0) as am5map.MapPolygonSeries;

      // Map compartment value to RS
      const dataMapped = new Map<string, number>();
      data?.results.forEach((entry) => {
        const rs = entry.name;
        dataMapped.set(rs, entry.compartments[selectedCompartment]);
      });

      if (dataMapped.size > 0) {
        polygonSeries.mapPolygons.each((polygon) => {
          const regionData = polygon.dataItem?.dataContext as IRegionPolygon;
          regionData.value = dataMapped.get(regionData.RS) || Number.NaN;

          polygon.setAll({
            // set tooltip
            tooltipText:
              scenarioList[selectedScenario] && selectedCompartment
                ? `${t(`BEZ.${regionData.BEZ}`)} {GEN}\n${selectedCompartment}: {value}`
                : `${t(`BEZ.${regionData.BEZ}`)} {GEN}`,
            // set fill color
            fill: Number.isNaN(regionData.value)
              ? am5.color(theme.palette.background.default)
              : getColorFromLegend(regionData.value, dummyLegend),
          });
        });
      }
    }
  }, [scenarioList, selectedScenario, selectedCompartment, selectedDate, dispatch, t, data, theme]);

  return (
    <>
      <Box id='mapdiv' height={'500px'} />
      <Box
        id='legenddiv'
        sx={{
          mt: 3,
          height: '30px',
          backgroundColor: theme.palette.background.default,
        }}
      />
      <HeatLegend
        legend={dummyLegend}
        exposeLegend={(legend: am5.HeatLegend | null) => {
          legendRef.current = legend;
        }}
        min={dummyLegend[0].value}
        max={dummyLegend[dummyLegend.length - 1].value}
      />
    </>
  );
}

function getColorFromLegend(value: number, legend: IHeatmapLegendItem[]): am5.Color {
  if (value <= legend[0].value) {
    return am5.color(legend[0].color);
  } else if (value >= legend[legend.length - 1].value) {
    return am5.color(legend[legend.length - 1].color);
  } else {
    let upperTick = legend[0];
    let lowerTick = legend[0];
    for (let i = 1; i < legend.length; i++) {
      if (value <= legend[i].value) {
        upperTick = legend[i];
        lowerTick = legend[i - 1];
        break;
      }
    }
    return am5.Color.interpolate(
      (value - lowerTick.value) / (upperTick.value - lowerTick.value),
      am5.color(lowerTick.color),
      am5.color(upperTick.color)
    );
  }
}
