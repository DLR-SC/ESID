import React from 'react';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4maps from '@amcharts/amcharts4/maps';
import {useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {useAppDispatch} from '../../store/hooks';
import {selectDistrict} from '../../store/DataSelectionSlice';
import {useAppSelector} from '../../store/hooks';
import {makeStyles} from '@mui/styles';
import {Box} from '@mui/material';
const {useRef} = React;

const useStyles = makeStyles({
  Map: {
    height: '500px',
  },

  Heatlegend: {
    marginTop: '15px',
    height: '30px',
    backgroundColor: '#F2F2F2',
  },
});

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
    {color: 'green', stop: 0},
    {color: 'yellow', stop: 35},
    {color: 'orange', stop: 50},
    {color: 'red', stop: 100},
    {color: 'purple', stop: 200},
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
  const selectedScenario = useAppSelector((state) => state.dataSelection.scenario);
  const selectedCompartment = useAppSelector((state) => state.dataSelection.compartment);
  const selectedValue = useAppSelector((state) => state.dataSelection.value);
  const selectedRate = useAppSelector((state) => state.dataSelection.rate);
  const scenarioList = useAppSelector((state) => state.scenarioList);

  const chartRef = useRef<am4maps.MapChart | null>(null);

  const {t} = useTranslation('global');
  const classes = useStyles();
  const dispatch = useAppDispatch();

  //Chart
  useEffect(() => {
    // Create map instance
    const chart = am4core.create('chartdiv', am4maps.MapChart);
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

    chartRef.current = chart;
    return () => {
      chartRef.current && chartRef.current.dispose();
    };
  }, [t, dispatch]);

  // Heat Legend
  useEffect(() => {
    // add heat legend container
    const legendContainer = am4core.create('legenddiv', am4core.Container);
    legendContainer.width = am4core.percent(100);
    const heatLegend = legendContainer.createChild(am4maps.HeatLegend);
    heatLegend.valign = 'bottom';
    heatLegend.orientation = 'horizontal';
    heatLegend.height = am4core.percent(20);
    heatLegend.minValue = dummyProps.legend[0].stop;
    heatLegend.maxValue = dummyProps.legend[dummyProps.legend.length - 1].stop;
    heatLegend.minColor = am4core.color('#F2F2F2');
    heatLegend.maxColor = am4core.color('#F2F2F2');
    heatLegend.align = 'center';

    // override heatLegend gradient
    // function to normalize stop to 0..1 for gradient
    const normalize = (x: number): number => {
      return (
        (x - dummyProps.legend[0].stop) /
        (dummyProps.legend[dummyProps.legend.length - 1].stop - dummyProps.legend[0].stop)
      );
    };
    // create new gradient and add color for each item in props, then add it to heatLegend to override
    const gradient = new am4core.LinearGradient();
    dummyProps.legend.forEach((item) => {
      gradient.addColor(am4core.color(item.color), 1, normalize(item.stop));
    });
    heatLegend.markers.template.adapter.add('fill', () => gradient);

    // resize and pack axis labels
    heatLegend.valueAxis.renderer.labels.template.fontSize = 9;
    heatLegend.valueAxis.renderer.minGridDistance = 20;
  }, []);

  // Polygon
  useEffect(() => {
    let regionPolygon: IRegionPolygon;

    if (chartRef.current) {
      // Create map polygon series
      const polygonSeries = chartRef.current.series.push(new am4maps.MapPolygonSeries());
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

      // Set values to each regions
      polygonSeries.events.on('validated', (event) => {
        event.target.mapPolygons.each((mapPolygon) => {
          regionPolygon = mapPolygon.dataItem.dataContext as IRegionPolygon;
          regionPolygon.value = Math.floor(Math.random() * 210);
          // add tooltipText, omit compartment if none selected
          mapPolygon.tooltipText = `${t(`BEZ.${regionPolygon.BEZ}`)} {GEN}`;
          // append scenario label to tooltip if selected
          if (scenarioList[selectedScenario]) {
            mapPolygon.tooltipText += `\nScenario: ${scenarioList[selectedScenario].label}`;
          }
          // append compartment info if selected
          if (scenarioList[selectedScenario] && selectedCompartment) {
            mapPolygon.tooltipText += `\nCompartment: ${selectedCompartment}
                                       Value: ${String(selectedValue)} (${String(selectedRate)}%)`;
          }
        });
      });

      // Assign colors to regions
      polygonSeries.events.on('validated', (event) => {
        event.target.mapPolygons.each((mapPolygon) => {
          regionPolygon = mapPolygon.dataItem.dataContext as IRegionPolygon;

          // interpolate color from upper and lower color stop
          const getColor = (x: number): am4core.Color => {
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
            return new am4core.Color(
              am4core.colors.interpolate(
                am4core.color(lower.color).rgb,
                am4core.color(upper.color).rgb,
                (x - lower.stop) / (upper.stop - lower.stop)
              )
            );
          };

          mapPolygon.fill = getColor(regionPolygon.value);
        });
      });

      polygonSeries.useGeodata = true;
      // Create hover state and set alternative fill color
      const hs = polygonTemplate.states.create('hover');
      hs.properties.fill = am4core.color('#367B25');
    }
  }, [scenarioList, selectedScenario, selectedCompartment, selectedValue, selectedRate, dispatch, t]);

  return (
    <>
      <Box id='chartdiv' className={classes.Map} />
      <Box id='legenddiv' className={classes.Heatlegend} />
    </>
  );
}
