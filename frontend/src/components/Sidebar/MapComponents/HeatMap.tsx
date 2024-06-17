// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {useState, useEffect, useRef, useMemo} from 'react';
import * as am5 from '@amcharts/amcharts5';
import * as am5map from '@amcharts/amcharts5/map';
import {GeoJSON} from 'geojson';
import {FeatureCollection} from '../../../types/map';
import svgZoomResetURL from '../../../../assets/svg/zoom_out_map_white_24dp.svg?url';
import svgZoomInURL from '../../../../assets/svg/zoom_in_white_24dp.svg?url';
import svgZoomOutURL from '../../../../assets/svg/zoom_out_white_24dp.svg?url';
import {FeatureProperties} from '../../../types/map';
import {HeatmapLegend} from '../../../types/heatmapLegend';
import {Box} from '@mui/material';
import {useTheme} from '@mui/material/styles';
import React from 'react';
import {Localization} from 'types/localization';
import useRoot from '../MapWrapper/Root';
import usePolygonSeries from '../MapWrapper/PoligonSeries';
import useMapChart from '../MapWrapper/Map';
import { useConst } from 'util/hooks';

interface MapProps {
  /** The data to be displayed on the map, in GeoJSON format. */
  mapData: undefined | FeatureCollection;

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
  tooltipText?: (regionData: FeatureProperties) => string;

  /** Optional function to generate tooltip text while data is being fetched. Default is a function that returns 'Loading...'. */
  tooltipTextWhileFetching?: (regionData: FeatureProperties) => string;

  /** The default selected region's data. */
  defaultSelectedValue: FeatureProperties;

  /** Optional currently selected scenario identifier. */
  selectedScenario?: number | null;

  /** Optional flag indicating if data is being fetched. Default is false. */
  isDataFetching?: boolean;

  /** Array of values for the map regions, where each value includes an ID and a corresponding numeric value. */
  values: {id: string | number; value: number}[] | undefined;

  /** Callback function to update the selected region's data. */
  setSelectedArea: (area: FeatureProperties) => void;

  /** The currently selected region's data. */
  selectedArea: FeatureProperties;

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
  idValuesToMap?: string;
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
  selectedScenario = 0,
  isDataFetching = false,
  values,
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
  idValuesToMap = 'id',
}: MapProps) {
  const theme = useTheme();
  const lastSelectedPolygon = useRef<am5map.MapPolygon | null>(null);
  const [longLoadTimeout, setLongLoadTimeout] = useState<number>();

  // Memoize the default localization object to avoid infinite re-renders
  const defaultLocalization = useMemo(() => {
    return {
      formatNumber: (value: number) => value.toString(),
      customLang: 'global',
      overrides: {},
    };
  }, []);

  // Use the provided localization or default to the memoized one
  const localizationToUse = localization || defaultLocalization;

  // This memo returns if the required data is currently being fetched. Either the case data or the scenario data.
  const isFetching = useMemo(() => {
    if (selectedScenario == null) {
      return true;
    }
    return isDataFetching;
  }, [isDataFetching, selectedScenario]);

  // This effect is responsible for showing the loading indicator if the data is not ready within 1 second. This
  // prevents that the indicator is showing for every little change.
  useEffect(() => {
    if (isFetching) {
      setLongLoadTimeout(
        window.setTimeout(() => {
          setLongLoad(true);
        }, 1000)
      );
    } else {
      clearTimeout(longLoadTimeout);
      setLongLoad(false);
    }
    // eslint-disable-next-line
  }, [isFetching, setLongLoad, setLongLoadTimeout]); // longLoadTimeout is deliberately ignored here.

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
  }, [fixedLegendMaxValue, setAggregatedMax, values]);

  const mapRoot = useRoot(mapId);

  const mapSettings = useMemo(() => {
    if (mapRoot) {
      return {
        projection: am5map.geoMercator(),
        maxZoomLevel: maxZoomLevel,
        maxPanOut: 0.4,
        zoomControl: am5map.ZoomControl.new(mapRoot, {paddingBottom: 25, opacity: 0.5}),
      };
    } else return;
  }, [mapRoot, maxZoomLevel]);

  const chart = useMapChart(mapRoot, mapSettings, useConst(() => {}));

  const polygon = useMemo(() => {
    return {
      geoJSON: mapData as GeoJSON,
      tooltipPosition: 'fixed',
    } as am5map.IMapPolygonSeriesSettings;
  }, [mapData]);

  const polygonSeries = usePolygonSeries(mapRoot, chart, polygon);

  useEffect(() => {
    if (mapRoot && chart && polygonSeries) {
      chart.zoomControl = am5map.ZoomControl.new(mapRoot, {paddingBottom: 25, opacity: 0.5});

      const fixSVGPosition = {width: 25, height: 25, dx: -5, dy: -3};

      chart.zoomControl.homeButton.events.on('click', () => {
        if (defaultSelectedValue) {
          setSelectedArea(defaultSelectedValue);
        }
      });

      chart.zoomControl.homeButton.set(
        'icon',
        am5.Picture.new(mapRoot, {
          src: svgZoomResetURL,
          ...fixSVGPosition,
        }) as unknown as am5.Graphics
      );

      chart.zoomControl.plusButton.set(
        'icon',
        am5.Picture.new(mapRoot, {src: svgZoomInURL, ...fixSVGPosition}) as unknown as am5.Graphics
      );
      chart.zoomControl.minusButton.set(
        'icon',
        am5.Picture.new(mapRoot, {src: svgZoomOutURL, ...fixSVGPosition}) as unknown as am5.Graphics
      );

      const polygonTemplate = polygonSeries.mapPolygons.template;
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

      polygonTemplate.events.on('click', function (ev) {
        if (ev.target.dataItem?.dataContext) {
          setSelectedArea(ev.target.dataItem.dataContext as FeatureProperties);
        }
      });

      polygonTemplate.events.on('pointerover', (e) => {
        if (legendRef.current) {
          const value = (e.target.dataItem?.dataContext as FeatureProperties).value as number;
          legendRef.current.showValue(value, localizationToUse.formatNumber!(value));
        }
      });

      polygonTemplate.events.on('pointerout', () => {
        if (legendRef.current) {
          void legendRef.current.hideTooltip();
        }
      });
    }
  }, [
    mapRoot,
    chart,
    polygonSeries,
    defaultFill,
    theme.palette.background.default,
    theme.palette.primary.main,
    fillOpacity,
    setSelectedArea,
    localizationToUse.formatNumber,
    legendRef,
  ]);

  useEffect(() => {
    if (!polygonSeries) return;
    // Reset last selected polygon
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
      if (mapPolygon.dataItem && mapPolygon.dataItem.dataContext) {
        const areaData = mapPolygon.dataItem.dataContext as FeatureProperties;
        const id: string | number = areaData[idValuesToMap];
        if (id == selectedArea[idValuesToMap]) {
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
  }, [
    idValuesToMap,
    polygonSeries,
    selectedArea,
    selectedArea.id,
    theme.palette.background.default,
    theme.palette.primary.main,
  ]);

  // set Data
  useEffect(() => {
    if (!polygonSeries) return;
    if (selectedScenario !== null && !isFetching && values && Number.isFinite(aggregatedMax)) {
      const map = new Map<string | number, number>();
      if (!values) return;
      values.forEach((value) => {
        map.set(value.id, value.value);
      });
      polygonSeries.mapPolygons.each((polygon) => {
        const regionData = polygon.dataItem?.dataContext as FeatureProperties;
        regionData.value = map.get(regionData[idValuesToMap]) ?? Number.NaN;
        // determine fill color
        let fillColor = am5.color(defaultFill);
        if (Number.isFinite(regionData.value) && typeof regionData.value === 'number') {
          if (legend.steps[0].value == 0 && legend.steps[legend.steps.length - 1].value == 1) {
            // if legend is normalized, also pass mix & max to color function
            fillColor = getColorFromLegend(regionData.value, legend, {
              min: 0,
              max: aggregatedMax,
            });
          } else {
            // if legend is not normalized, min & max are first and last stop of legend and don't need to be passed
            fillColor = getColorFromLegend(regionData.value, legend);
          }
        }
        polygon.setAll({
          tooltipText: tooltipText(regionData),
          fill: fillColor,
        });
      });
    } else if (longLoad || !values) {
      polygonSeries.mapPolygons.each((polygon) => {
        const regionData = polygon.dataItem?.dataContext as FeatureProperties;
        regionData.value = Number.NaN;
        polygon.setAll({
          tooltipText: tooltipTextWhileFetching(regionData),
          fill: am5.color(theme.palette.text.disabled),
        });
      });
    }
  }, [
    mapRoot,
    chart,
    aggregatedMax,
    defaultFill,
    idValuesToMap,
    isFetching,
    legend,
    longLoad,
    polygonSeries,
    selectedScenario,
    theme.palette.text.disabled,
    tooltipText,
    tooltipTextWhileFetching,
    values,
  ]);

  return <Box id={mapId} height={mapHeight} />;
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
