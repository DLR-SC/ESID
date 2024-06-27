// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {useState, useEffect, useMemo, useCallback, useRef} from 'react';
import * as am5 from '@amcharts/amcharts5';
import * as am5map from '@amcharts/amcharts5/map';
import {GeoJSON} from 'geojson';
import svgZoomResetURL from '../../../../assets/svg/zoom_out_map_white_24dp.svg?url';
import svgZoomInURL from '../../../../assets/svg/zoom_in_white_24dp.svg?url';
import svgZoomOutURL from '../../../../assets/svg/zoom_out_white_24dp.svg?url';
import {Box} from '@mui/material';
import {useTheme} from '@mui/material/styles';
import React from 'react';
import useMapChart from '../../shared/HeatMap/Map';
import usePolygonSeries from '../../shared/HeatMap/Polygon';
import useZoomControl from '../../shared/HeatMap/Zoom';
import useRoot from '../../shared/Root';
import {HeatmapLegend} from '../../../types/heatmapLegend';
import {Localization} from '../../../types/localization';
import {FeatureCollection, FeatureProperties} from '../../../types/map';

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
  tooltipText?: (regionData: FeatureProperties, value: number) => string;

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
  legendRef?: React.MutableRefObject<am5.HeatLegend | null>;

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
  tooltipText,
  tooltipTextWhileFetching,
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
  legendRef = {current: null},
  longLoad = false,
  setLongLoad = () => {},
  localization,
  idValuesToMap = 'id',
}: MapProps) {
  const theme = useTheme();
  const [longLoadTimeout, setLongLoadTimeout] = useState<number>();
  const [settings, setSettings] = useState<
    | {
        id: number | string;
        value: number;
        polygonSettings?: {[key: string]: am5.Color | number | string};
      }[]
    | undefined
  >(values);

  const lastSelectedPolygon = useRef<string | number>();

  // This memo returns if the required data is currently being fetched. Either the case data or the scenario data.
  const isFetching = useMemo(() => {
    if (selectedScenario == null) {
      return true;
    }
    return isDataFetching;
  }, [isDataFetching, selectedScenario]);

  const root = useRoot(mapId);

  const zoomSettings = useMemo(() => {
    return {
      paddingBottom: 25,
      opacity: 50,
    };
  }, []);

  const zoom = useZoomControl(
    root,
    zoomSettings,
    useCallback(
      (zoom: am5map.ZoomControl) => {
        if (!root || root.isDisposed()) return;
        const fixSVGPosition = {
          width: 25,
          height: 25,
          dx: -5,
          dy: -3,
        };
        zoom.homeButton.set('visible', true);
        zoom.homeButton.set(
          'icon',
          am5.Picture.new(root, {
            src: svgZoomResetURL,
            ...fixSVGPosition,
          }) as unknown as am5.Graphics
        );
        zoom.plusButton.set(
          'icon',
          am5.Picture.new(root, {
            src: svgZoomInURL,
            ...fixSVGPosition,
          }) as unknown as am5.Graphics
        );
        zoom.minusButton.set(
          'icon',
          am5.Picture.new(root, {
            src: svgZoomOutURL,
            ...fixSVGPosition,
          }) as unknown as am5.Graphics
        );
      },
      [root]
    )
  );

  useEffect(() => {
    if (!zoom || zoom.isDisposed() || !root || root.isDisposed()) return;
    zoom.homeButton.events.on('click', () => {
      setSelectedArea(defaultSelectedValue);
    });
  }, [zoom, root, setSelectedArea, defaultSelectedValue]);

  const chartSettings = useMemo(() => {
    if (!zoom) return null;
    return {
      projection: am5map.geoMercator(),
      maxZoomLevel: maxZoomLevel,
      maxPanOut: 0.4,
      zoomControl: zoom,
    };
  }, [maxZoomLevel, zoom]);

  const chart = useMapChart(root, chartSettings);

  const polygonSettings = useMemo(() => {
    return {
      geoJSON: mapData as GeoJSON,
      tooltipPosition: 'fixed',
    } as am5map.IMapPolygonSeriesSettings;
  }, [mapData]);

  const polygonSeries = usePolygonSeries(
    root,
    chart,
    polygonSettings,
    useCallback(
      (polygonSeries: am5map.MapPolygonSeries) => {
        const polygonTemplate = polygonSeries.mapPolygons.template;

        // Set properties for each polygon
        polygonTemplate.setAll({
          fill: am5.color(defaultFill),
          stroke: am5.color(theme.palette.background.default),
          strokeWidth: 1,
          fillOpacity: fillOpacity,
          templateField: 'polygonSettings',
        });

        polygonTemplate.states.create('hover', {
          stroke: am5.color(theme.palette.primary.main),
          strokeWidth: 2,
          layer: 1,
        });
      },
      [defaultFill, fillOpacity, theme.palette.background.default, theme.palette.primary.main]
    )
  );

  // Set heat map properties
  //show tooltip on heat legend when hovering
  useEffect(() => {
    if (polygonSeries) {
      const polygonTemplate = polygonSeries.mapPolygons.template;

      polygonTemplate.events.on('click', function (ev) {
        if (ev.target.dataItem?.dataContext) {
          setSelectedArea(ev.target.dataItem.dataContext as FeatureProperties);
        }
      });

      polygonTemplate.events.on('pointerover', (e) => {
        if (legendRef && legendRef.current) {
          const value = (e.target.dataItem?.dataContext as FeatureProperties).value as number;
          legendRef.current.showValue(
            value,
            localization && localization.formatNumber ? localization.formatNumber(value) : value.toString()
          );
        }
      });

      //hide tooltip on heat legend when not hovering anymore event
      polygonTemplate.events.on('pointerout', () => {
        if (legendRef && legendRef.current) {
          void legendRef.current.hideTooltip();
        }
      });
    }
  }, [localization, legendRef, polygonSeries, setSelectedArea]);

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

  // This effect is responsible for updating the fill color of the polygons based on the values and the legend.
  useEffect(() => {
    if (!polygonSeries) return;
    if (selectedScenario !== null && values && Number.isFinite(aggregatedMax) && !isFetching) {
      const polygonColors = values.map((value) => {
        let fillColor = am5.color(defaultFill);
        if (legend.steps[0].value == 0 && legend.steps[legend.steps.length - 1].value == 1) {
          // if legend is normalized, also pass mix & max to color function
          fillColor = getColorFromLegend(value.value, legend, {
            min: 0,
            max: aggregatedMax,
          });
        } else {
          // if legend is not normalized, min & max are first and last stop of legend and don't need to be passed
          fillColor = getColorFromLegend(value.value, legend);
        }
        return {
          id: value.id,
          value: value.value,
          polygonSettings: {fill: fillColor},
        };
      });
      setSettings((settings) => {
        if (settings && settings.length > 0) {
          return settings.map((setting) => {
            const newSetting = polygonColors.find((newSetting) => newSetting.id === setting.id);
            if (!setting.polygonSettings) return {id: setting.id, value: setting.value, ...newSetting?.polygonSettings};
            return {
              id: setting.id,
              value: setting.value,
              polygonSettings: {...setting.polygonSettings, ...newSetting?.polygonSettings},
            };
          });
        }
        return polygonColors;
      });
    } else if (longLoad || !values) {
      polygonSeries.setAll({
        fill: am5.color(theme.palette.text.disabled),
      });
    }
  }, [
    aggregatedMax,
    isFetching,
    longLoad,
    theme.palette.text.disabled,
    selectedScenario,
    polygonSeries,
    values,
    legend,
    defaultFill,
  ]);

  const [startingSelectedAreaSettings, setStartingSelectedAreaSettings] = useState<
    | {
        id: number | string;
        value: number;
        polygonSettings?: {[key: string]: am5.Color | number | string};
      }[]
    | undefined
  >();

  useEffect(() => {
    if (startingSelectedAreaSettings === undefined && values) {
      const initialSettings = values.map((value) => {
        if (value.id === selectedArea[idValuesToMap]) {
          return {
            id: value.id,
            value: value.value,
            polygonSettings: {
              stroke: am5.color(theme.palette.primary.main),
              strokeWidth: 2,
              layer: 1,
            },
          };
        }
        return {id: value.id, value: value.value};
      });
      setStartingSelectedAreaSettings(initialSettings);
    }
    // eslint-disable-next-line
  }, [values]);

  // This effect is responsible for updating the selected polygon's stroke color and width.
  useEffect(() => {
    setSettings((settings) => {
      if (!settings) {
        return startingSelectedAreaSettings;
      } else {
        const selectedId = selectedArea[idValuesToMap];
        const lastSelectedId = lastSelectedPolygon.current;
        const primaryStroke = am5.color(theme.palette.primary.main);
        const defaultStroke = am5.color(theme.palette.background.default);

        return settings.map((setting) => {
          const isSelected = setting.id === selectedId;
          const isLastSelected = setting.id === lastSelectedId;

          if (isSelected || isLastSelected) {
            return {
              id: setting.id,
              value: setting.value,
              polygonSettings: {
                ...setting.polygonSettings,
                stroke: isSelected ? primaryStroke : defaultStroke,
                strokeWidth: isSelected ? 2 : 1,
                layer: isSelected ? 1 : 0,
              },
            };
          }

          return setting;
        });
      }
    });
    lastSelectedPolygon.current = selectedArea[idValuesToMap];
  }, [
    selectedArea,
    theme.palette.primary.main,
    theme.palette.background.default,
    idValuesToMap,
    startingSelectedAreaSettings,
  ]);
  const valuesMap = useMemo(() => {
    const valuesMap = new Map<number | string, number>();
    if (values)
      values.forEach((value) => {
        valuesMap.set(value.id, value.value);
      });
    return valuesMap;
  }, [values]);

  const tooltipsMap = useMemo(() => {
    const tooltipsMap = new Map<number | string, string>();
    if (mapData) {
      mapData.features.forEach((feature) => {
        if (feature.properties) {
          const tooltip =
            longLoad || valuesMap.size === 0
              ? tooltipTextWhileFetching
                ? tooltipTextWhileFetching(feature.properties)
                : 'Loading...'
              : tooltipText
                ? tooltipText(feature.properties, valuesMap.get(feature.properties[idValuesToMap]) as number)
                : `${feature.properties[idValuesToMap]}`;
          tooltipsMap.set(feature.properties[idValuesToMap], tooltip);
        }
      });
    }
    return tooltipsMap;
  }, [mapData, valuesMap, longLoad, idValuesToMap, tooltipText, tooltipTextWhileFetching]);

  // This effect is responsible for updating the tooltip text for each polygon.
  useEffect(() => {
    if (!mapData) return;
    setSettings((settings) => {
      if (!settings)
        return mapData.features.map((feature) => {
          return {
            id: feature.properties[idValuesToMap],
            value: 0,
          };
        });
      return settings.map((setting) => {
        return {
          id: setting.id,
          value: valuesMap.get(setting.id) as number,
          polygonSettings: {
            ...setting.polygonSettings,
            tooltipText: tooltipsMap.get(setting.id) as string,
          },
        };
      });
    });
  }, [valuesMap, tooltipsMap, mapData, idValuesToMap]);

  // This effect is responsible for updating the map data when the mapData prop changes.
  useEffect(() => {
    if (
      !polygonSeries ||
      !settings ||
      !settings.some(
        (setting) =>
          setting.polygonSettings &&
          setting.polygonSettings.fill != am5.color(defaultFill) &&
          setting.polygonSettings.tooltipText
      )
    )
      return;
    polygonSeries.data.setAll(settings);
  }, [settings, polygonSeries, defaultFill]);

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
