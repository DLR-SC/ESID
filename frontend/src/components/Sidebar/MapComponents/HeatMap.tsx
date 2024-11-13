// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

// React imports
import React, {useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';

// Third-party
import * as am5 from '@amcharts/amcharts5';
import * as am5map from '@amcharts/amcharts5/map';
import {Box} from '@mui/material';
import {useTheme} from '@mui/material/styles';
import {Feature, GeoJSON, GeoJsonProperties} from 'geojson';

// Local components
import MapControlBar from './MapControlBar';
import useMapChart from 'components/shared/HeatMap/Map';
import usePolygonSeries from 'components/shared/HeatMap/Polygon';
import useRoot from 'components/shared/Root';

// Types and interfaces
import {HeatmapLegend} from '../../../types/heatmapLegend';
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

  /** Optional currently selected scenario identifier. */
  selectedScenario?: number | null;

  /** Optional flag indicating if data is being fetched. Default is false. */
  isDataFetching?: boolean;

  /** Array of values for the map regions, where each value includes an ID and a corresponding numeric value. */
  values: {id: string | number; value: number}[] | undefined;

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
  areaId = 'id',
}: MapProps) {
  const theme = useTheme();
  const lastSelectedPolygon = useRef<am5map.MapPolygon | null>(null);
  const [longLoadTimeout, setLongLoadTimeout] = useState<number>();

  // This memo returns if the required data is currently being fetched. Either the case data or the scenario data.
  const isFetching = useMemo(() => {
    if (selectedScenario == null) {
      return true;
    }
    return isDataFetching;
  }, [isDataFetching, selectedScenario]);

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
    // This effect should only re-run when the fetching state changes
    // eslint-disable-next-line
  }, [isFetching, setLongLoad, setLongLoadTimeout]); // longLoadTimeout is deliberately ignored here.

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
        if (mapPolygon.dataItem && mapPolygon.dataItem.dataContext) {
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

  // Update fill color and tooltip of map polygons based on values
  useEffect(() => {
    if (!polygonSeries || polygonSeries.isDisposed()) return;

    const updatePolygons = () => {
      if (selectedScenario !== null && !isFetching && values && Number.isFinite(aggregatedMax) && polygonSeries) {
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
    selectedScenario,
    isFetching,
    values,
    aggregatedMax,
    defaultFill,
    legend,
    tooltipText,
    longLoad,
    tooltipTextWhileFetching,
    theme.palette.text.disabled,
    areaId,
  ]);

  return (
    <Box
      id={mapId}
      height={mapHeight}
      sx={{
        position: 'relative',
        width: '100%',
        '& > div:first-of-type': {
          position: 'absolute',
          width: '100%',
          height: '100%',
        },
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
