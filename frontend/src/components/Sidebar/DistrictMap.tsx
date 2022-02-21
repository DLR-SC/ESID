import React, {useEffect} from 'react';
import {useTheme} from '@mui/material/styles';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4maps from '@amcharts/amcharts4/maps';
import {useTranslation} from 'react-i18next';
import {useAppDispatch, useAppSelector} from '../../store/hooks';
import {selectDistrict} from '../../store/DataSelectionSlice';
import {Box, CircularProgress, Container} from '@mui/material';
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

const heatColors = [
  am4core.color('rgb(161,217,155)'),
  am4core.color('rgb(255,255,204)'),
  am4core.color('rgb(255,237,160)'),
  am4core.color('rgb(254,217,118)'),
  am4core.color('rgb(254,178,76)'),
  am4core.color('rgb(253,141,60)'),
  am4core.color('rgb(252,78,42)'),
  am4core.color('rgb(227,26,28)'),
  am4core.color('rgb(189,0,38)'),
  am4core.color('rgb(128,0,38)'),
  am4core.color('rgb(0,0,0)'),
];

export default function DistrictMap(): JSX.Element {
  const selectedScenario = useAppSelector((state) => state.dataSelection.scenario);
  const selectedCompartment = useAppSelector((state) => state.dataSelection.compartment);
  const selectedDate = useAppSelector((state) => state.dataSelection.date);
  const scenarioList = useAppSelector((state) => state.scenarioList.scenarios);

  const {data, isUninitialized, isLoading, isFetching} = useGetSimulationDataByDateQuery(
    {
      id: selectedScenario ?? 0,
      day: selectedDate ?? '',
      group: 'total',
      compartments: [selectedCompartment ?? ''],
    },
    {skip: !selectedScenario || !selectedCompartment || !selectedDate}
  );

  const chartRef = useRef<am4maps.MapChart | null>(null);
  const heatLegendRef = useRef<am4maps.HeatLegend | null>(null);
  const seriesRef = useRef<am4maps.MapPolygonSeries | null>(null);

  const {t} = useTranslation('global');
  const theme = useTheme();
  const dispatch = useAppDispatch();

  //Chart
  useEffect(() => {
    // Create map instance
    const chart = am4core.create('mapdiv', am4maps.MapChart);
    // Set map definition
    chart.geodataSource.url = 'assets/lk_germany_reduced.geojson';
    // Set projection
    chart.projection = new am4maps.projections.Mercator();
    // Zoom control
    chart.zoomControl = new am4maps.ZoomControl();
    chart.zoomControl.align = 'left';
    chart.zoomControl.paddingBottom = 25;
    chart.zoomControl.opacity = 50;
    chart.seriesContainer.draggable = true;
    dispatch(selectDistrict({ags: '00000', name: t('germany'), type: ''}));

    // Create map polygon series
    const polygonSeries = chart.series.push(new am4maps.MapPolygonSeries());
    // Configure series
    polygonSeries.mapPolygons.template.tooltipPosition = 'fixed';
    if (polygonSeries.tooltip) {
      polygonSeries.tooltip.label.wrap = true;
    }
    const polygonTemplate = polygonSeries.mapPolygons.template;
    polygonTemplate.events.on('hit', (e) => {
      const item = e.target.dataItem.dataContext as IRegionPolygon;
      dispatch(selectDistrict({ags: item.RS, name: item.GEN, type: t(item.BEZ)}));
    });
    // add hover state
    const hs = polygonTemplate.states.create('hover');
    hs.properties.stroke = am4core.color(theme.palette.primary.main);
    // pull polygon to front on hover
    polygonTemplate.events.on('over', (e) => {
      e.target.zIndex = Number.MAX_VALUE;
      e.target.toFront();
    });

    polygonSeries.useGeodata = true;

    // add heat legend container
    const legendContainer = am4core.create('legenddiv', am4core.Container);
    legendContainer.width = am4core.percent(100);
    const heatLegend = legendContainer.createChild(am4maps.HeatLegend);
    heatLegend.width = am4core.percent(75);
    heatLegend.valign = 'bottom';
    heatLegend.orientation = 'horizontal';
    heatLegend.height = am4core.percent(20);
    heatLegend.minValue = 0;
    heatLegend.maxValue = 1;
    heatLegend.minColor = heatColors[0];
    heatLegend.maxColor = heatColors[heatColors.length - 1];
    heatLegend.align = 'center';
    heatLegend.series = polygonSeries;

    // create new gradient and add color for each item in props, then add it to heatLegend to override
    const gradient = new am4core.LinearGradient();
    heatColors.forEach((item) => {
      gradient.addColor(item, 1);
    });
    heatLegend.markers.template.adapter.add('fill', () => gradient);

    // resize and pack axis labels
    heatLegend.valueAxis.renderer.labels.template.fontSize = 9;
    heatLegend.valueAxis.renderer.minGridDistance = 35;

    chartRef.current = chart;
    seriesRef.current = polygonSeries;
    heatLegendRef.current = heatLegend;
    return () => {
      chartRef.current && chartRef.current.dispose();
      seriesRef.current && seriesRef.current.dispose();
      heatLegendRef.current && heatLegendRef.current.dispose();
    };
  }, [t, theme, dispatch]);

  useEffect(() => {
    if (seriesRef.current && selectedCompartment && selectedScenario) {
      const polygonSeries = seriesRef.current;

      let maxValue = 0;
      const dataMapped = new Map<string, number>();
      data?.results.forEach((entry) => {
        const rs = entry.name;
        dataMapped.set(rs, entry.compartments[selectedCompartment]);
        if (rs !== '00000') {
          maxValue =
            entry.compartments[selectedCompartment] > maxValue ? entry.compartments[selectedCompartment] : maxValue;
        }
      });

      if (heatLegendRef.current) {
        heatLegendRef.current.maxValue = Math.round(maxValue);
      }

      // Set values to each regions
      const event = polygonSeries.events.on('validated', (event) => {
        event.target.mapPolygons.each((mapPolygon) => {
          const regionPolygon = mapPolygon.dataItem.dataContext as IRegionPolygon;
          regionPolygon.value = dataMapped.get(regionPolygon.RS) || 0;
          mapPolygon.fill = getColor(regionPolygon.value, 0, maxValue);
          // set background color to scenario
          if (mapPolygon.tooltip) {
            mapPolygon.tooltip.getFillFromObject = false;
            mapPolygon.tooltip.background.fill = am4core.color(theme.custom.scenarios[selectedScenario - 1]);
          }
          // add tooltipText, omit compartment if none selected
          mapPolygon.tooltipText = `${t(`BEZ.${regionPolygon.BEZ}`)} ${regionPolygon.GEN}`;
          // append compartment info if selected
          if (scenarioList[selectedScenario] && selectedCompartment) {
            mapPolygon.tooltipText += `\n${selectedCompartment}: ${regionPolygon.value.toFixed(0)}`;
          }
        });
      });

      polygonSeries.invalidateRawData();

      return () => {
        event.dispose();
      };
    }
    return () => undefined;
  }, [data, scenarioList, selectedCompartment, selectedScenario, t, theme]);

  return (
    <Container sx={{position: 'relative'}}>
      <Box id='mapdiv' height={'650px'} />
      <Box
        id='legenddiv'
        sx={{
          mt: 3,
          height: '30px',
          backgroundColor: theme.palette.background.default,
        }}
      />
      {(isUninitialized || isLoading || isFetching) && (
        <CircularProgress
          size={96}
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            marginTop: '-48px',
            marginLeft: '-48px',
          }}
        />
      )}
    </Container>
  );
}

function getColor(workingValue: number, minValue: number, maxValue: number) {
  // calculate percentage and restrict it between 0 and 1
  const percent = Math.max(0, Math.min(1, (workingValue - minValue) / (maxValue - minValue)));
  const intervals = heatColors.length - 1;
  const fract = 1 / intervals;

  const colorIndex = Math.max(0, Math.ceil(intervals * percent - 1));
  if (isFinite(colorIndex)) {
    return new am4core.Color(
      am4core.colors.interpolate(
        heatColors[colorIndex].rgb,
        heatColors[colorIndex + 1].rgb,
        (percent - colorIndex * fract) / fract
      )
    );
  }
  return heatColors[0];
}
