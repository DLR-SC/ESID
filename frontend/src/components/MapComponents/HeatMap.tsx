// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {useState, useEffect, useRef, useMemo} from 'react';
import * as am5 from '@amcharts/amcharts5';
import * as am5map from '@amcharts/amcharts5/map';
import {GeoJSON} from 'geojson';
import {FeatureCollection} from '../../types/map';
import svgZoomResetURL from '../../../assets/svg/zoom_out_map_white_24dp.svg?url';
import svgZoomInURL from '../../../assets/svg/zoom_in_white_24dp.svg?url';
import svgZoomOutURL from '../../../assets/svg/zoom_out_white_24dp.svg?url';
import {FeatureProperties} from '../../types/map';
import {HeatmapLegend} from '../../types/heatmapLegend';
import {Box} from '@mui/material';
import {useTheme} from '@mui/material/styles';
import React from 'react';

interface MapProps {
  mapData: undefined | FeatureCollection;
  mapId?: string;
  mapHeight?: string;
  defaultFill?: number | string;
  fillOpacity?: number;
  tooltipText?: (regionData: FeatureProperties) => string;
  tooltipTextWhileFetching?: (regionData: FeatureProperties) => string;
  defaultSelectedValue: FeatureProperties;
  selectedScenario?: number | null;
  isDataFetching?: boolean;
  values: {id: string | number; value: number}[] | undefined;
  setSelectedArea: (area: FeatureProperties) => void;
  selectedArea: FeatureProperties;
  aggregatedMax: number;
  setAggregatedMax: (max: number) => void;
  fixedLegendMaxValue?: number | null;
  legend: HeatmapLegend;
  legendRef: React.MutableRefObject<am5.HeatLegend | null>;
  longLoad: boolean;
  setLongLoad: (longLoad: boolean) => void;
  formatNumber: (value: number) => string;
  idValuesToMap?: string;
}

export default function HeatMap({
  mapData,
  mapId = 'map',
  mapHeight = '650px',
  defaultFill = '#8c8c8c',
  fillOpacity = 1,
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
  longLoad,
  setLongLoad,
  formatNumber,
  idValuesToMap = 'id',
}: MapProps) {
  const theme = useTheme();
  const lastSelectedPolygon = useRef<am5map.MapPolygon | null>(null);
  const [polygonSeries, setPolygonSeries] = useState<am5map.MapPolygonSeries | null>(null);
  const [longLoadTimeout, setLongLoadTimeout] = useState<number>();

  // This memo returns if the required data is currently being fetched. Either the case data or the scenario data.
  const isFetching = useMemo(() => {
    if (selectedScenario === null) {
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

  // Create Map with GeoData
  useEffect(() => {
    if (!mapData) return;

    // Create map instance
    const root = am5.Root.new(mapId);
    const chart = root.container.children.push(
      am5map.MapChart.new(root, {
        projection: am5map.geoMercator(),
        maxZoomLevel: 4,
        maxPanOut: 0.4,
        zoomControl: am5map.ZoomControl.new(root, {
          paddingBottom: 25,
          opacity: 50,
        }),
      })
    );

    // Add home button to reset pan & zoom
    chart.get('zoomControl')?.homeButton.set('visible', true);

    // Settings to fix positioning of images on buttons
    const fixSVGPosition = {
      width: 25,
      height: 25,
      dx: -5,
      dy: -3,
    };

    // Set svg icon for home button
    chart.get('zoomControl')?.homeButton.set(
      'icon',
      am5.Picture.new(root, {
        src: svgZoomResetURL,
        ...fixSVGPosition,
      }) as unknown as am5.Graphics
    );

    // Add function to select germany when home button is pressed
    chart.get('zoomControl')?.homeButton.events.on('click', () => {
      if (defaultSelectedValue) {
        setSelectedArea(defaultSelectedValue);
      }
    });

    // Set svg icon for plus button
    chart.get('zoomControl')?.plusButton.set(
      'icon',
      am5.Picture.new(root, {
        src: svgZoomInURL,
        ...fixSVGPosition,
      }) as unknown as am5.Graphics
    );

    // Set svg icon for minus button
    chart.get('zoomControl')?.minusButton.set(
      'icon',
      am5.Picture.new(root, {
        src: svgZoomOutURL,
        ...fixSVGPosition,
      }) as unknown as am5.Graphics
    );

    // Create polygon series
    const polygonSeries = chart.series.push(
      am5map.MapPolygonSeries.new(root, {
        geoJSON: mapData as GeoJSON,
        tooltipPosition: 'fixed',
      })
    );

    // Get template for polygons to attach events etc to each
    const polygonTemplate = polygonSeries.mapPolygons.template;

    // Set properties for each polygon
    polygonTemplate.setAll({
      fill: am5.color(defaultFill),
      stroke: am5.color(theme.palette.background.default),
      strokeWidth: 1,
      fillOpacity: fillOpacity,
    });

    // Set hover properties for each polygon
    polygonTemplate.states.create('hover', {
      stroke: am5.color(theme.palette.primary.main),
      strokeWidth: 2,
      layer: 1,
    });

    // Set click properties for each polygon
    polygonTemplate.events.on('click', function (ev) {
      if (ev.target.dataItem && ev.target.dataItem.dataContext) {
        setSelectedArea(ev.target.dataItem.dataContext as FeatureProperties);
      }
    });

    // Set heat map properties
    //show tooltip on heat legend when hovering
    polygonTemplate.events.on('pointerover', (e) => {
      if (legendRef.current) {
        const value = (e.target.dataItem?.dataContext as {value: number}).value;
        legendRef.current.showValue(value, formatNumber(value));
      }
    });
    //hide tooltip on heat legend when not hovering anymore event
    polygonTemplate.events.on('pointerout', () => {
      if (legendRef.current) {
        void legendRef.current.hideTooltip();
      }
    });

    setPolygonSeries(polygonSeries);

    return () => {
      chart.dispose();
      root.dispose();
    };
  }, [
    defaultFill,
    fillOpacity,
    mapId,
    theme.palette.background.default,
    theme.palette.primary.main,
    formatNumber,
    mapData,
    setSelectedArea,
    defaultSelectedValue,
    legendRef,
  ]);

  // Highlight selected district
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
        const {id} = mapPolygon.dataItem.dataContext as {id: string};
        if (id == selectedArea.id) {
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
  }, [polygonSeries, selectedArea.id, theme.palette.background.default, theme.palette.primary.main]);

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
        const originalRegionData = polygon.dataItem?.dataContext as FeatureProperties;
        const regionData = {...originalRegionData};
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
        const originalRegionData = polygon.dataItem?.dataContext as FeatureProperties;
        const regionData = {...originalRegionData};
        regionData.value = Number.NaN;
        polygon.setAll({
          tooltipText: tooltipTextWhileFetching(regionData),
          fill: am5.color(theme.palette.text.disabled),
        });
      });
    }
  }, [
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
  return <Box id={mapId} height={mapHeight}></Box>;
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
