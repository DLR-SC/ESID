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

// Dummy Props for Heat Legend
const dummyProps = {
  legend: [
    {color: '#00FF00', stop: 0},
    {color: '#FFFF00', stop: 35},
    {color: '#FFA500', stop: 50},
    {color: '#FF0000', stop: 100},
    {color: '#800080', stop: 200},
  ],
};

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
    // add heat legend container
    const legendContainer4 = am4core.create('legenddiv', am4core.Container);
    legendContainer4.width = am4core.percent(100);
    const heatLegend4 = legendContainer4.createChild(am4maps.HeatLegend);
    heatLegend4.valign = 'bottom';
    heatLegend4.orientation = 'horizontal';
    heatLegend4.height = am4core.percent(20);
    heatLegend4.minValue = dummyProps.legend[0].stop;
    heatLegend4.maxValue = dummyProps.legend[dummyProps.legend.length - 1].stop;
    heatLegend4.minColor = am4core.color('#F2F2F2');
    heatLegend4.maxColor = am4core.color('#F2F2F2');
    heatLegend4.align = 'center';

    // override heatLegend gradient
    // function to normalize stop to 0..1 for gradient
    const normalize = (x: number): number => {
      return (
        (x - dummyProps.legend[0].stop) /
        (dummyProps.legend[dummyProps.legend.length - 1].stop - dummyProps.legend[0].stop)
      );
    };
    // create new gradient and add color for each item in props, then add it to heatLegend to override
    const gradient4 = new am4core.LinearGradient();
    dummyProps.legend.forEach((item) => {
      gradient4.addColor(am4core.color(item.color), 1, normalize(item.stop));
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

          // calculate fill color
          // color interpolation function
          const getColor = (x: number): am5.Color => {
            let upper = {color: '#FFF', stop: 0};
            let lower = {color: '#FFF', stop: 0};
            for (let i = 0; i < dummyProps.legend.length; i++) {
              upper = dummyProps.legend[i];
              if (upper.stop > x) {
                lower = dummyProps.legend[i - 1];
                break;
              }
            }
            // interpolate color between upper and lower
            return am5.Color.interpolate(
              (x - lower.stop) / (upper.stop - lower.stop),
              am5.color(lower.color),
              am5.color(upper.color),
              'hsl'
            );
          };

          polygon.setAll({
            // set tooltip
            tooltipText:
              scenarioList[selectedScenario] && selectedCompartment
                ? `${t(`BEZ.${regionData.BEZ}`)} {GEN}\n${selectedCompartment}: {value}`
                : `${t(`BEZ.${regionData.BEZ}`)} {GEN}`,
            // set fill color
            fill: Number.isNaN(regionData.value)
              ? am5.color(theme.palette.background.default)
              : getColor(regionData.value),
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
    </>
  );
}
