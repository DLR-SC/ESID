// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {useEffect, useMemo, useState, useRef} from 'react';
import {useTheme} from '@mui/material/styles';
import * as am5 from '@amcharts/amcharts5';
import * as am5map from '@amcharts/amcharts5/map';
import {useTranslation} from 'react-i18next';
import {useAppDispatch, useAppSelector} from '../../store/hooks';
import {selectDistrict} from '../../store/DataSelectionSlice';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import LockIcon from '@mui/icons-material/Lock';
import {useGetSimulationDataByDateQuery} from 'store/services/scenarioApi';
import HeatLegend from './HeatLegend';
import {NumberFormatter} from 'util/hooks';
import HeatLegendEdit from './HeatLegendEdit';
import {HeatmapLegend} from '../../types/heatmapLegend';
import LockOpen from '@mui/icons-material/LockOpen';
import LoadingContainer from '../shared/LoadingContainer';
import {useGetCaseDataByDateQuery} from '../../store/services/caseDataApi';
import mapData from '../../../assets/lk_germany_reduced.geojson?url';

interface IRegionPolygon {
  value: number;

  /** District name */
  GEN: string;

  /** District type */
  BEZ: string;

  /** AGS (district ID) */
  RS: string;
}

export default function DistrictMap(): JSX.Element {
  const [geodata, setGeodata] = useState<GeoJSON.GeoJSON | null>(null);
  const [longLoad, setLongLoad] = useState(false);
  const [longLoadTimeout, setLongLoadTimeout] = useState<number>();
  const selectedDistrict = useAppSelector((state) => state.dataSelection.district);
  const selectedScenario = useAppSelector((state) => state.dataSelection.scenario);
  const selectedCompartment = useAppSelector((state) => state.dataSelection.compartment);
  const selectedDate = useAppSelector((state) => state.dataSelection.date);
  const scenarioList = useAppSelector((state) => state.scenarioList.scenarios);
  const legend = useAppSelector((state) => state.userPreference.selectedHeatmap);
  const [chart, setChart] = useState<am5map.MapChart | null>(null);

  const {data: simulationData, isFetching: isSimulationDataFetching} = useGetSimulationDataByDateQuery(
    {
      id: selectedScenario ?? 0,
      day: selectedDate ?? '',
      groups: ['total'],
      compartments: [selectedCompartment ?? ''],
    },
    {skip: selectedScenario === null || selectedScenario === 0 || !selectedCompartment || !selectedDate}
  );

  const {data: caseData, isFetching: isCaseDataFetching} = useGetCaseDataByDateQuery(
    {
      day: selectedDate ?? '',
      groups: ['total'],
      compartments: [selectedCompartment ?? ''],
    },
    {skip: selectedScenario === null || selectedScenario > 0 || !selectedCompartment || !selectedDate}
  );

  const legendRef = useRef<am5.HeatLegend | null>(null);
  const {t, i18n} = useTranslation();
  const {t: tBackend} = useTranslation('backend');
  const {formatNumber} = NumberFormatter(i18n.language, 1, 0);
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const lastSelectedPolygon = useRef<am5map.MapPolygon | null>(null);
  const [fixedLegendMaxValue, setFixedLegendMaxValue] = useState<number | null>(null);

  // This memo either returns the case data or simulation data, depending on which card is selected.
  const data = useMemo(() => {
    if (selectedScenario === null) {
      return null;
    }

    if (selectedScenario === 0 && caseData !== undefined && caseData.results.length > 0) {
      return caseData;
    } else if (selectedScenario > 0 && simulationData !== undefined && simulationData.results.length > 0) {
      return simulationData;
    }

    return null;
  }, [caseData, simulationData, selectedScenario]);

  // This memo returns if the required data is currently being fetched. Either the case data or the scenario data.
  const isFetching = useMemo(() => {
    if (selectedScenario === null) {
      return true;
    }

    return (selectedScenario === 0 && isCaseDataFetching) || (selectedScenario > 0 && isSimulationDataFetching);
  }, [selectedScenario, isCaseDataFetching, isSimulationDataFetching]);

  // use Memoized to store aggregated max and only recalculate if parameters change
  const aggregatedMax: number = useMemo(() => {
    if (fixedLegendMaxValue) {
      return fixedLegendMaxValue;
    }
    let max = 1;

    if (data && selectedCompartment !== null) {
      data.results.forEach((entry) => {
        if (entry.name !== '00000') {
          max = Math.max(entry.compartments[selectedCompartment], max);
        }
      });
    }
    return max;
  }, [selectedCompartment, data, fixedLegendMaxValue]);

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

  // fetch geojson
  useEffect(() => {
    fetch(mapData, {
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

    // Create polygon series
    const polygonSeries = chart.series.push(
      am5map.MapPolygonSeries.new(root, {
        geoJSON: geodata ?? undefined,
        tooltipPosition: 'fixed',
        layer: 0,
      })
    );

    // get template for polygons to attach events etc to each
    const polygonTemplate = polygonSeries.mapPolygons.template;
    polygonTemplate.setAll({
      stroke: am5.color(theme.palette.background.default),
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
      layer: 1,
    });

    //show tooltip on heat legend when hovering
    polygonTemplate.events.on('pointerover', (e) => {
      if (legendRef.current) {
        const value = (e.target.dataItem?.dataContext as IRegionPolygon).value;
        legendRef.current.showValue(value, formatNumber(value));
      }
    });
    //hide tooltip on heat legend when not hovering anymore event
    polygonTemplate.events.on('pointerout', () => {
      if (legendRef.current) {
        void legendRef.current.hideTooltip();
      }
    });
    setChart(chart);
    return () => {
      chart?.dispose();
      root?.dispose();
    };
  }, [geodata, theme, t, formatNumber, dispatch]);

  useEffect(() => {
    // unselect previous
    if (chart && lastSelectedPolygon.current) {
      // reset style
      lastSelectedPolygon.current.states.create('default', {
        stroke: am5.color(theme.palette.background.default),
        strokeWidth: 1,
        layer: 0,
      });
      lastSelectedPolygon.current.states.apply('default');
    }
    // select new
    if (selectedDistrict.ags !== '00000' && chart && chart.series.length > 0) {
      const series = chart.series.getIndex(0) as am5map.MapPolygonSeries;
      series.mapPolygons.each((polygon) => {
        const data = polygon.dataItem?.dataContext as IRegionPolygon;
        if (data.RS === selectedDistrict.ags) {
          polygon.states.create('default', {
            stroke: am5.color(theme.palette.primary.main),
            strokeWidth: 2,
            layer: 2,
          });
          if (!polygon.isHover()) {
            polygon.states.apply('default');
          }
          // save polygon
          lastSelectedPolygon.current = polygon;
        }
      });
    }
  }, [chart, selectedDistrict, theme]);

  // set Data
  useEffect(() => {
    if (chart && chart.series.length > 0) {
      const polygonSeries = chart.series.getIndex(0) as am5map.MapPolygonSeries;
      if (selectedScenario !== null && selectedCompartment && !isFetching && data) {
        // Map compartment value to RS
        const dataMapped = new Map<string, number>();
        data?.results.forEach((entry) => {
          const rs = entry.name;
          dataMapped.set(rs, entry.compartments[selectedCompartment]);
        });

        if (dataMapped.size > 0) {
          polygonSeries.mapPolygons.each((polygon) => {
            const regionData = polygon.dataItem?.dataContext as IRegionPolygon;
            regionData.value = dataMapped.get(regionData.RS) ?? Number.NaN;

            // determine fill color
            let fillColor = am5.color(theme.palette.background.default);
            if (Number.isFinite(regionData.value)) {
              if (legend.steps[0].value == 0 && legend.steps[legend.steps.length - 1].value == 1) {
                // if legend is normalized, also pass mix & max to color function
                fillColor = getColorFromLegend(regionData.value, legend, {min: 0, max: aggregatedMax});
              } else {
                // if legend is not normalized, min & max are first and last stop of legend and don't need to be passed
                fillColor = getColorFromLegend(regionData.value, legend);
              }
            }

            const bez = t(`BEZ.${regionData.BEZ}`);
            const compartmentName = tBackend(`infection-states.${selectedCompartment}`);
            polygon.setAll({
              tooltipText:
                selectedScenario !== null && selectedCompartment
                  ? `${bez} {GEN}\n${compartmentName}: ${formatNumber(regionData.value)}`
                  : `${bez} {GEN}`,
              fill: fillColor,
            });
          });
        }
      } else if (longLoad || !data) {
        polygonSeries.mapPolygons.each((polygon) => {
          const regionData = polygon.dataItem?.dataContext as IRegionPolygon;
          regionData.value = Number.NaN;
          const bez = t(`BEZ.${regionData.BEZ}`);
          polygon.setAll({
            tooltipText: `${bez} {GEN}`,
            fill: am5.color(theme.palette.text.disabled),
          });
        });
      }
    }
  }, [
    scenarioList,
    selectedScenario,
    selectedCompartment,
    selectedDate,
    aggregatedMax,
    dispatch,
    t,
    formatNumber,
    data,
    theme,
    isFetching,
    legend,
    longLoad,
    tBackend,
    chart,
  ]);

  return (
    <LoadingContainer show={isFetching && longLoad} overlayColor={theme.palette.background.default}>
      <Box id='mapdiv' height={'650px'} />
      <Grid container px={1}>
        <Grid item container xs={11} alignItems='flex-end'>
          <HeatLegend
            legend={legend}
            exposeLegend={(legend: am5.HeatLegend | null) => {
              // move exposed legend item (or null if disposed) into ref
              legendRef.current = legend;
            }}
            min={0}
            // use math.round to convert the numbers to integers
            max={
              legend.isNormalized ? Math.round(aggregatedMax) : Math.round(legend.steps[legend.steps.length - 1].value)
            }
            displayText={true}
            id={'legend'}
          />
        </Grid>
        <Grid item container justifyContent='center' xs={1}>
          <Tooltip title={t('heatlegend.lock').toString()} placement='right' arrow>
            <IconButton
              color={'primary'}
              aria-label={t('heatlegend.lock')}
              onClick={() => setFixedLegendMaxValue(fixedLegendMaxValue ? null : aggregatedMax)}
              size='small'
              sx={{padding: theme.spacing(0)}}
            >
              {fixedLegendMaxValue ? <LockIcon /> : <LockOpen />}
            </IconButton>
          </Tooltip>
          <HeatLegendEdit />
        </Grid>
      </Grid>
    </LoadingContainer>
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
