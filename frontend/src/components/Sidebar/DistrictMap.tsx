import React, {useState, useEffect, useMemo} from 'react';
import {useTheme} from '@mui/material/styles';
import * as am5 from '@amcharts/amcharts5';
import * as am5map from '@amcharts/amcharts5/map';
import {useTranslation} from 'react-i18next';
import {useAppDispatch, useAppSelector} from '../../store/hooks';
import {selectDistrict} from '../../store/DataSelectionSlice';
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
  {color: 'rgb(161,217,155)', value: 0},
  {color: 'rgb(255,255,204)', value: 1 / 11},
  {color: 'rgb(255,237,160)', value: 2 / 11},
  {color: 'rgb(255,237,160)', value: 3 / 11},
  {color: 'rgb(254,217,118)', value: 4 / 11},
  {color: 'rgb(254,178,76)', value: 5 / 11},
  {color: 'rgb(253,141,60)', value: 6 / 11},
  {color: 'rgb(252,78,42)', value: 7 / 11},
  {color: 'rgb(227,26,28)', value: 8 / 11},
  {color: 'rgb(189,0,38)', value: 9 / 11},
  {color: 'rgb(128,0,38)', value: 10 / 11},
  {color: 'rgb(0,0,0)', value: 1},
];

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

  // use Memoized to store aggregated max and only recalculate if parameters change
  const aggregatedMax = useMemo(() => {
    let max = 0;
    if (data && selectedCompartment) {
      data.results.forEach((entry) => {
        if (entry.name !== '00000') {
          max = entry.compartments[selectedCompartment] > max ? entry.compartments[selectedCompartment] : max;
        }
      });
    }
    console.log('Recalc Max:', max);
    return max;
  }, [selectedCompartment, data]);

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
      // show tooltip on heat legend
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

  // set Data
  useEffect(() => {
    if (chartRef.current && chartRef.current.series.length > 0 && selectedCompartment && selectedScenario) {
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
              ? // set fill to background if value is NaN
                am5.color(theme.palette.background.default)
              : // else check if legend is normalized or not
              dummyLegend[0].value == 0 && dummyLegend[dummyLegend.length - 1].value == 1
              ? // use function with min/max if legend is normalized
                getColorFromLegend(regionData.value, dummyLegend, 0, aggregatedMax)
              : // use function w/o if legend has absolute values
                getColorFromLegend(regionData.value, dummyLegend),
          });
        });
      }
    }
  }, [scenarioList, selectedScenario, selectedCompartment, selectedDate, aggregatedMax, dispatch, t, data, theme]);

  return (
    <>
      {console.log('Render Max:', aggregatedMax)}
      <Box id='mapdiv' height={'650px'} />
      <HeatLegend
        legend={dummyLegend}
        exposeLegend={(legend: am5.HeatLegend | null) => {
          // move exposed legend item (or null if disposed) into ref
          legendRef.current = legend;
        }}
        min={0}
        max={aggregatedMax}
        isNormalized={true}
      />
    </>
  );
}

function getColorFromLegend(
  value: number,
  legend: IHeatmapLegendItem[],
  aggregatedMin: number,
  aggregatedMax: number
): am5.Color;
function getColorFromLegend(
  value: number,
  legend: IHeatmapLegendItem[],
  aggregatedMin?: undefined,
  aggregatedMax?: undefined
): am5.Color;
function getColorFromLegend(
  value: number,
  legend: IHeatmapLegendItem[],
  aggregatedMin?: number,
  aggregatedMax?: number
) {
  // assume legend stops are absolute
  let normalizedValue = value;
  // if aggregated values (min/max) are set, the legend items are already normalized => need to normalize value too
  if (!(aggregatedMin === undefined || aggregatedMax === undefined)) {
    normalizedValue = (value - aggregatedMin) / (aggregatedMax - aggregatedMin);
  }
  if (normalizedValue <= legend[0].value) {
    return am5.color(legend[0].color);
  } else if (normalizedValue >= legend[legend.length - 1].value) {
    return am5.color(legend[legend.length - 1].color);
  } else {
    let upperTick = legend[0];
    let lowerTick = legend[0];
    for (let i = 1; i < legend.length; i++) {
      if (normalizedValue <= legend[i].value) {
        upperTick = legend[i];
        lowerTick = legend[i - 1];
        break;
      }
    }
    return am5.Color.interpolate(
      (normalizedValue - lowerTick.value) / (upperTick.value - lowerTick.value),
      am5.color(lowerTick.color),
      am5.color(upperTick.color)
    );
  }
}
