// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

// React imports
import React, {useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';

// Third-party
import * as am5 from '@amcharts/amcharts5';
import * as am5map from '@amcharts/amcharts5/map';
import Box from '@mui/material/Box';
import useTheme from '@mui/material/styles/useTheme';
import {Feature, GeoJSON, GeoJsonProperties} from 'geojson';

// Local components
import MapControlBar from './MapControlBar';
import useMapChart from 'components/shared/HeatMap/Map';
import usePolygonSeries from 'components/shared/HeatMap/Polygon';
import useRoot from 'components/shared/Root';

// Types and interfaces
import {HeatmapLegend} from 'types/heatmapLegend';
import {Localization} from 'types/localization';

// Utils
import {useConst} from 'util/hooks';

interface MapProps {
  /** The data to be displayed on the map, in GeoJSON format. */
  mapData: undefined | GeoJSON;

  /** Optional unique identifier for the map. Default is 'map'. */
  mapId?: string;

  /** Optional height for the map. Default is '650px'. */
  mapHeight?: string;

  /** Optional default fill color for the map regions. Default is '#8c8c8c'. */
  defaultFill?: number | string;

  /** Optional fill opacity for the map regions. Default is 1. */
  fillOpacity?: number;

  /** Optional maximum zoom level for the map. Default is 4. */
  maxZoomLevel?: number;

  /** Optional function to generate tooltip text for each region based on its data. Default is a function that returns the region's ID. */
  tooltipText?: (regionData: GeoJsonProperties) => string;

  /** Optional function to generate tooltip text while data is being fetched. Default is a function that returns 'Loading...'. */
  tooltipTextWhileFetching?: (regionData: GeoJsonProperties) => string;

  /** The default selected region's data. */
  defaultSelectedValue: GeoJsonProperties;

  /** Optional flag indicating if data is being fetched. Default is false. */
  isDataFetching?: boolean;

  /** Array of values for the map regions, where each value includes an ID and a corresponding numeric value. */
  values: {id: string | number; value: number}[] | undefined;

  edgeData: Array<{start: string | number; end: string | number; value: number}> | undefined;

  /** Callback function to update the selected region's data. */
  setSelectedArea: (area: GeoJsonProperties) => void;

  /** The currently selected region's data. */
  selectedArea: GeoJsonProperties;

  /** The maximum aggregated value for the heatmap legend. */
  aggregatedMax: number;

  /** Callback function to update the maximum aggregated value. */
  setAggregatedMax: (max: number) => void;

  /** Optional fixed maximum value for the heatmap legend. */
  fixedLegendMaxValue?: number | null;

  /** The heatmap legend configuration. */
  legend: HeatmapLegend;

  /** Reference to the heatmap legend element. */
  legendRef: React.MutableRefObject<am5.HeatLegend | null>;

  /** Optional flag indicating if data loading takes a long time. Default is false. */
  longLoad?: boolean;

  /** Optional callback function to update the long load flag. Default is an empty function. */
  setLongLoad?: (longLoad: boolean) => void;

  /** Optional localization settings for the heatmap. */
  localization?: Localization;

  /** Optional identifier for mapping values to regions. Default is 'id'. */
  areaId?: string;
}

/**
 * React Component to render a Heatmap.
 */
export default function HeatMap({
  mapData,
  mapId = 'map',
  mapHeight = '650px',
  defaultFill = '#8c8c8c',
  fillOpacity = 1,
  maxZoomLevel = 4,
  tooltipText = () => '{id}',
  tooltipTextWhileFetching = () => 'Loading...',
  defaultSelectedValue,
  isDataFetching = false,
  values,
  edgeData,
  setSelectedArea,
  selectedArea,
  aggregatedMax,
  setAggregatedMax,
  fixedLegendMaxValue,
  legend,
  legendRef,
  longLoad = false,
  setLongLoad = () => {},
  localization,
  areaId = 'id',
}: MapProps) {
  const theme = useTheme();
  const lastSelectedPolygon = useRef<am5map.MapPolygon | null>(null);
  const [longLoadTimeout, setLongLoadTimeout] = useState<number>();

  const root = useRoot(mapId);

  // MapControlBar.tsx
  // Add home button click handler
  const handleHomeClick = useCallback(() => {
    setSelectedArea(defaultSelectedValue);
  }, [setSelectedArea, defaultSelectedValue]);

  const chartSettings = useMemo(() => {
    return {
      projection: am5map.geoMercator(),
      maxZoomLevel: maxZoomLevel,
      maxPanOut: 0.4,
    };
  }, [maxZoomLevel]);

  const chart = useMapChart(root, chartSettings);

  // Series for drawing edges (lines) and arrowheads between polygons
  const lineSeriesRef = useRef<am5map.MapLineSeries | null>(null);
  const arrowSeriesRef = useRef<am5map.MapPointSeries | null>(null);

  const polygonSettings = useMemo(() => {
    if (!mapData) return null;
    return {
      geoJSON: mapData,
      tooltipPosition: 'fixed',
      layer: 0,
    } as am5map.IMapPolygonSeriesSettings;
  }, [mapData]);

  const polygonSeries = usePolygonSeries(
    root,
    chart,
    polygonSettings,
    useConst((polygonSeries: am5map.MapPolygonSeries) => {
      const polygonTemplate = polygonSeries.mapPolygons.template;
      // Set properties for each polygon
      polygonTemplate.setAll({
        fill: am5.color(defaultFill),
        stroke: am5.color(theme.palette.background.default),
        strokeWidth: 1,
        fillOpacity: fillOpacity,
      });
      polygonTemplate.states.create('hover', {
        stroke: am5.color(theme.palette.primary.main),
        strokeWidth: 2,
        layer: 1,
      });
    })
  );

  // Create/cleanup line and arrow series for edges
  useEffect(() => {
    if (!root || !chart) return;

    // Create line series if not existing
    if (!lineSeriesRef.current || lineSeriesRef.current.isDisposed()) {
      const lineSeries = am5map.MapLineSeries.new(root, {
        layer: 2, // above polygons
      });
      lineSeries.mapLines.template.setAll({
        stroke: am5.color(theme.palette.primary.main),
        strokeOpacity: 0.9,
        strokeWidth: 1.5,
      });
      chart.series.push(lineSeries);
      lineSeriesRef.current = lineSeries;
    }

    // Create arrow (point) series if not existing
    if (!arrowSeriesRef.current || arrowSeriesRef.current.isDisposed()) {
      const arrowSeries = am5map.MapPointSeries.new(root, {
        layer: 3, // above lines
      });
      // Bullet to show a small triangle as arrow head
      arrowSeries.bullets.push(() => {
        const triangle = am5.Triangle.new(root, {
          width: 10,
          height: 12,
          fill: am5.color(theme.palette.primary.main),
          fillOpacity: 0.9,
          centerX: am5.percent(50),
          centerY: am5.percent(50),
        });
        return am5.Bullet.new(root, {
          sprite: triangle,
        });
      });
      chart.series.push(arrowSeries);
      arrowSeriesRef.current = arrowSeries;
    }

    return () => {
      if (lineSeriesRef.current && !lineSeriesRef.current.isDisposed()) {
        lineSeriesRef.current.dispose();
        lineSeriesRef.current = null;
      }
      if (arrowSeriesRef.current && !arrowSeriesRef.current.isDisposed()) {
        arrowSeriesRef.current.dispose();
        arrowSeriesRef.current = null;
      }
    };
  }, [chart, root, theme.palette.primary.main]);

  // This effect is responsible for setting the selected area when a region is clicked and showing the value of the hovered region in the legend.
  useLayoutEffect(() => {
    if (!polygonSeries) return;
    const polygonTemplate = polygonSeries.mapPolygons.template;

    polygonTemplate.events.on('click', function (ev) {
      if (ev.target.dataItem?.dataContext) {
        setSelectedArea(ev.target.dataItem.dataContext as GeoJsonProperties);
      }
    });

    polygonTemplate.events.on('pointerover', (e) => {
      if (legendRef && legendRef.current) {
        const value = (e.target.dataItem?.dataContext as GeoJsonProperties)?.value as number;
        legendRef.current.showValue(
          value,
          localization?.formatNumber ? localization.formatNumber(value) : value.toString()
        );
      }
    });
    //hide tooltip on heat legend when not hovering anymore event
    polygonTemplate.events.on('pointerout', () => {
      if (legendRef && legendRef.current) {
        void legendRef.current.hideTooltip();
      }
    });
    // This effect should only run when the polygon series is set
  }, [polygonSeries, legendRef, localization, setSelectedArea, theme.palette.primary.main]);

  // This effect is responsible for showing the loading indicator if the data is not ready within 1 second. This
  // prevents that the indicator is showing for every little change.
  useEffect(() => {
    if (isDataFetching) {
      setLongLoadTimeout(
        window.setTimeout(() => {
          setLongLoad(true);
        }, 1000)
      );
    } else {
      clearTimeout(longLoadTimeout);
      setLongLoad(false);
    }
    // This effect should only re-run when the fetching state changes
    // eslint-disable-next-line
  }, [isDataFetching, setLongLoad, setLongLoadTimeout]); // longLoadTimeout is deliberately ignored here.

  // Set aggregatedMax if fixedLegendMaxValue is set or values are available
  useEffect(() => {
    if (fixedLegendMaxValue) {
      setAggregatedMax(fixedLegendMaxValue);
    } else if (values) {
      let max = 1;
      values.forEach((value) => {
        max = Math.max(value.value, max);
      });
      setAggregatedMax(max);
    }
    // This effect should only re-run when the fixedLegendMaxValue or values change
  }, [fixedLegendMaxValue, setAggregatedMax, values]);

  // Highlight selected polygon and reset last selected polygon
  useEffect(() => {
    if (!polygonSeries || polygonSeries.isDisposed()) return;
    // Reset last selected polygon
    const updatePolygons = () => {
      if (lastSelectedPolygon.current) {
        lastSelectedPolygon.current.states.create('default', {
          stroke: am5.color(theme.palette.background.default),
          strokeWidth: 1,
          layer: 0,
        });
        lastSelectedPolygon.current.states.apply('default');
      }
      // Highlight selected polygon
      polygonSeries.mapPolygons.each((mapPolygon) => {
        if (mapPolygon.dataItem?.dataContext) {
          const areaData = mapPolygon.dataItem.dataContext as Feature;
          const id: string | number = areaData[areaId as keyof Feature] as string | number;
          if (id == selectedArea![areaId as keyof GeoJsonProperties]) {
            mapPolygon.states.create('default', {
              stroke: am5.color(theme.palette.primary.main),
              strokeWidth: 2,
              layer: 1,
            });
            if (!mapPolygon.isHover()) {
              mapPolygon.states.apply('default');
            }
            lastSelectedPolygon.current = mapPolygon;
          }
        }
      });
    };

    const handleDataValidated = () => {
      if (!polygonSeries.isDisposed()) {
        updatePolygons();
      }
    };

    polygonSeries.events.on('datavalidated', handleDataValidated);
    handleDataValidated();

    // Cleanup event listeners on component unmount or when dependencies change
    return () => {
      if (!polygonSeries.isDisposed()) {
        polygonSeries.events.off('datavalidated', handleDataValidated);
      }
    };
    // This effect should only re-run when the selectedArea or polygonSeries change
  }, [areaId, polygonSeries, selectedArea, theme.palette.background.default, theme.palette.primary.main]);

  // Draw edges as arrows between polygons based on edgeData
  useEffect(() => {
    if (!edgeData || !polygonSeries || !lineSeriesRef.current || !arrowSeriesRef.current) return;
    if (polygonSeries.isDisposed() || lineSeriesRef.current.isDisposed() || arrowSeriesRef.current.isDisposed()) return;

    // Build a map from areaId to centroid [lon, lat]
    const idToCentroid = new Map<string | number, [number, number]>();

    // Compute centroids from the underlying GeoJSON features on the polygon series
    try {
      const source = (polygonSeries.get('geoJSON') || mapData) as GeoJSON | undefined;
      if (source && 'type' in source && source.type === 'FeatureCollection') {
        const fc = source as GeoJSON & {features: Array<Feature>};
        fc.features.forEach((f) => {
          const props = f.properties as GeoJsonProperties | null;
          if (!props) return;
          const key = props[areaId as string] as string | number;
          const centroid = computeCentroid(f);
          if (key !== undefined && centroid) {
            idToCentroid.set(key, centroid);
          }
        });
      }
    } catch (e) {
      // noop: if centroid computation fails, just skip drawing
    }

    const lineData: Array<any> = [];
    const arrowData: Array<any> = [];

    edgeData.forEach((edge) => {
      const start = idToCentroid.get(edge.start);
      const end = idToCentroid.get(edge.end);
      if (!start || !end) return;

      // Line between centroids
      lineData.push({
        geometry: {
          type: 'LineString',
          coordinates: [start, end],
        },
      });

      // Arrow head at end position, rotate towards direction
      const angle = bearingDeg(start, end);
      arrowData.push({
        geometry: {
          type: 'Point',
          coordinates: end,
        },
        angle,
      });
    });

    // Apply data
    lineSeriesRef.current.data.setAll(lineData);
    arrowSeriesRef.current.data.setAll(arrowData);

    // Set rotation of arrow heads via adapters
    arrowSeriesRef.current.bullets.clear();
    arrowSeriesRef.current.bullets.push((root, _series, dataItem) => {
      const angle = (dataItem.dataContext as any)?.angle ?? 0;
      const triangle = am5.Triangle.new(root, {
        width: 10,
        height: 12,
        fill: am5.color(theme.palette.primary.main),
        centerX: am5.percent(50),
        centerY: am5.percent(50),
        rotation: angle,
      });
      return am5.Bullet.new(root, {sprite: triangle});
    });
  }, [edgeData, polygonSeries, areaId, mapData, theme.palette.primary.main]);

  // Update fill color and tooltip of map polygons based on values
  useEffect(() => {
    if (!polygonSeries || polygonSeries.isDisposed()) return;

    const updatePolygons = () => {
      if (!isDataFetching && values && Number.isFinite(aggregatedMax) && polygonSeries) {
        const valueMap = new Map<string | number, number>();

        values.forEach((value) => valueMap.set(value.id, value.value));

        polygonSeries.mapPolygons.template.entities.forEach((polygon) => {
          const regionData = polygon.dataItem?.dataContext as GeoJsonProperties;
          if (regionData) {
            regionData.value = valueMap.get(regionData[areaId] as string | number) ?? Number.NaN;

            let fillColor = am5.color(defaultFill);
            if (Number.isFinite(regionData.value) && typeof regionData.value === 'number') {
              fillColor = getColorFromLegend(regionData.value, legend, {
                min: 0,
                max: aggregatedMax,
              });
            }
            polygon.setAll({
              tooltipText: tooltipText(regionData),
              fill: fillColor,
            });
          }
        });
      } else if (longLoad || !values) {
        polygonSeries.mapPolygons.template.entities.forEach((polygon) => {
          const regionData = polygon.dataItem?.dataContext as GeoJsonProperties;
          if (regionData) {
            regionData.value = Number.NaN;
            polygon.setAll({
              tooltipText: tooltipTextWhileFetching(regionData),
              fill: am5.color(theme.palette.text.disabled),
            });
          }
        });
      }
    };

    const handleDataValidated = () => {
      if (!polygonSeries.isDisposed()) {
        updatePolygons();
      }
    };

    polygonSeries.events.on('datavalidated', handleDataValidated);
    handleDataValidated();

    // Cleanup event listeners on component unmount or when dependencies change
    return () => {
      if (!polygonSeries.isDisposed()) {
        polygonSeries.events.off('datavalidated', handleDataValidated);
      }
    };
  }, [
    polygonSeries,
    values,
    aggregatedMax,
    defaultFill,
    legend,
    tooltipText,
    longLoad,
    tooltipTextWhileFetching,
    theme.palette.text.disabled,
    areaId,
    isDataFetching,
  ]);

  return (
    <Box
      id={mapId}
      height={mapHeight}
      sx={{
        position: 'relative',
        width: '100%',
      }}
    >
      {chart && <MapControlBar chart={chart} onHomeClick={handleHomeClick} maxZoomLevel={maxZoomLevel} />}
    </Box>
  );
}

function getColorFromLegend(
  value: number,
  legend: HeatmapLegend,
  aggregatedMinMax?: {min: number; max: number}
): am5.Color {
  // assume legend stops are absolute
  let normalizedValue = value;
  // if aggregated values (min/max) are properly set, the legend items are already normalized => need to normalize value too
  if (aggregatedMinMax && aggregatedMinMax.min < aggregatedMinMax.max) {
    const {min: aggregatedMin, max: aggregatedMax} = aggregatedMinMax;
    normalizedValue = (value - aggregatedMin) / (aggregatedMax - aggregatedMin);
  } else if (aggregatedMinMax) {
    // log error if any of the above checks fail
    console.error('Error: invalid MinMax array in getColorFromLegend', [value, legend, aggregatedMinMax]);
    // return completely transparent fill if errors occur
    return am5.color('rgba(0,0,0,0)');
  }
  if (normalizedValue <= legend.steps[0].value) {
    return am5.color(legend.steps[0].color);
  } else if (normalizedValue >= legend.steps[legend.steps.length - 1].value) {
    return am5.color(legend.steps[legend.steps.length - 1].color);
  } else {
    let upperTick = legend.steps[0];
    let lowerTick = legend.steps[0];
    for (let i = 1; i < legend.steps.length; i++) {
      if (normalizedValue <= legend.steps[i].value) {
        upperTick = legend.steps[i];
        lowerTick = legend.steps[i - 1];
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


// Compute a simple centroid [lon, lat] for Polygon or MultiPolygon features
function computeCentroid(feature: Feature): [number, number] | null {
  const geom: any = feature.geometry;
  if (!geom) return null;

  const collect = (coords: any): Array<[number, number]> => {
    const points: Array<[number, number]> = [];
    if (!coords) return points;
    // Walk arbitrarily nested coordinate arrays and collect lon/lat pairs
    const walk = (arr: any) => {
      if (!Array.isArray(arr)) return;
      if (arr.length >= 2 && typeof arr[0] === 'number' && typeof arr[1] === 'number') {
        const lon = Number(arr[0]);
        const lat = Number(arr[1]);
        if (Number.isFinite(lon) && Number.isFinite(lat)) points.push([lon, lat]);
        return;
      }
      for (const sub of arr) walk(sub);
    };
    walk(coords);
    return points;
  };

  let pts: Array<[number, number]> = [];
  if (geom.type === 'Polygon' || geom.type === 'MultiPolygon') {
    pts = collect(geom.coordinates);
  } else if (geom.type === 'Point') {
    const c = geom.coordinates as [number, number];
    return [Number(c[0]), Number(c[1])];
  } else {
    // Fallback: try to collect any coordinates present
    pts = collect(geom.coordinates);
  }
  if (pts.length === 0) return null;
  let sx = 0;
  let sy = 0;
  for (const p of pts) {
    sx += p[0];
    sy += p[1];
  }
  return [sx / pts.length, sy / pts.length];
}

// Bearing angle in degrees from start -> end, 0 to the right (east), increasing counter-clockwise
function bearingDeg(start: [number, number], end: [number, number]): number {
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  const rad = Math.atan2(dy, dx);
  const deg = (rad * 180) / Math.PI;
  return deg;
}
