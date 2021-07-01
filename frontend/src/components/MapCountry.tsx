import React from 'react';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4maps from '@amcharts/amcharts4/maps';
import {makeStyles} from '@material-ui/core';
import {Box} from '@material-ui/core';
import {useEffect} from 'react';
import {useTranslation} from 'react-i18next';

/* The Map component includes:
  - A detailed Map of Germany
  - Heat Legend container
  - Zoom control 
  The colors depends on temporary values assigned to each region.  
*/

const useStyles = makeStyles({
  MapStyle: {
    height: '300px',
  },

  HeatlegendStyle: {
    marginTop: '15px',
    height: '25px',
    backgroundColor: '#F8F8F9',
  },
});

interface IregionPolygon {
  value: number;
  BEZ: string;
}

export default function MapCountry(): JSX.Element {
  const {t} = useTranslation('global');
  const classes = useStyles();

  useEffect(() => {
    let regionPolygon: IregionPolygon;
    let regionPolygonName: IregionPolygon;

    // Colors set of the Map
    const heatColors1 = [am4core.color('#34BEC7'), am4core.color('#3998DB'), am4core.color('#3abedf')];
    const heatColors2 = [am4core.color('#34BEC7'), am4core.color('#3998DB'), am4core.color('#3abedf')];
    const heatColors3 = [am4core.color('#34BEC7'), am4core.color('#3998DB'), am4core.color('#3abedf')];

    // Create map instance
    const chart = am4core.create('chartdiv', am4maps.MapChart);

    // Set map definition
    chart.geodataSource.url = 'assets/lk_germany_reduced.geojson';

    // Set projection
    chart.projection = new am4maps.projections.Mercator();

    //Create map polygon series
    const polygonSeries = chart.series.push(new am4maps.MapPolygonSeries());

    // Configure series
    polygonSeries.mapPolygons.template.tooltipPosition = 'fixed';
    const polygonTemplate = polygonSeries.mapPolygons.template;

    //Set values to each regions
    polygonSeries.events.on('validated', (event) => {
      event.target.mapPolygons.each((mapPolygon) => {
        regionPolygon = mapPolygon.dataItem.dataContext as IregionPolygon;
        regionPolygon.value = Math.floor(Math.random() * 300);
        // add tooltipText
        regionPolygonName = mapPolygon.tooltipDataItem.dataContext as IregionPolygon;
        const RegionBEZ = regionPolygonName.BEZ;
        RegionBEZ === 'Landkreis' || RegionBEZ === 'Kreis'
          ? (mapPolygon.tooltipText = t('BEZ.Kreis') + ' {GEN}')
          : (mapPolygon.tooltipText = t('BEZ.Stadtkreis') + ' {GEN}');
      });
    });

    //Assign colors to regions
    polygonSeries.events.on('validated', (event) => {
      event.target.mapPolygons.each((mapPolygon) => {
        regionPolygon = mapPolygon.dataItem.dataContext as IregionPolygon;
        const colorIndex = Math.floor(Math.random() * 2);
        if (regionPolygon.value <= 100) {
          mapPolygon.fill = heatColors1[colorIndex];
        } else if (regionPolygon.value >= 200 && regionPolygon.value <= 270) {
          mapPolygon.fill = heatColors2[colorIndex];
        } else {
          mapPolygon.fill = heatColors3[colorIndex];
        }
      });
    });

    // add heat legend containter
    const legendContainer = am4core.create('legenddiv', am4core.Container);
    legendContainer.width = am4core.percent(100);
    const heatLegend = legendContainer.createChild(am4maps.HeatLegend);
    heatLegend.valign = 'bottom';
    heatLegend.orientation = 'horizontal';
    heatLegend.height = am4core.percent(20);
    heatLegend.minColor = am4core.color('#F8F8F9');
    heatLegend.maxColor = am4core.color('#F8F8F9');
    heatLegend.align = 'center';

    //Zoom control
    chart.zoomControl = new am4maps.ZoomControl();
    chart.zoomControl.align = 'left';
    chart.zoomControl.paddingBottom = 25;
    chart.zoomControl.opacity = 50;
    chart.seriesContainer.draggable = false;
    polygonSeries.useGeodata = true;

    // Create hover state and set alternative fill color
    const hs = polygonTemplate.states.create('hover');
    hs.properties.fill = am4core.color('#367B25');
  }, []);

  return (
    <>
      <Box id="chartdiv" className={classes.MapStyle}></Box>
      <Box id="legenddiv" className={classes.HeatlegendStyle}></Box>
    </>
  );
}
