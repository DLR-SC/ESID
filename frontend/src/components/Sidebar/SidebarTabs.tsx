// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import Box from '@mui/material/Box';
import {useTranslation} from 'react-i18next';
import React, { useCallback, useContext, useMemo, useRef, useState } from 'react';
import logo from '../../../assets/logo/LOKI_compact.svg';
import { Grid, Typography } from '@mui/material';
import TabContext from '@mui/lab/TabContext';
import TabPanel from '@mui/lab/TabPanel';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import TabList from '@mui/lab/TabList';
import { selectTab } from 'store/UserPreferenceSlice';
import Tab, {tabClasses} from '@mui/material/Tab';
import {useTheme} from '@mui/material/styles';
import {buttonBaseClasses} from '@mui/material/ButtonBase';
import StatisticsDashboard from './StatisicsComponent/StatisticsDashboard';
import { Stack} from '@mui/material';
import * as am5 from '@amcharts/amcharts5';
import {HeatmapLegend} from 'types/heatmapLegend';
import i18n from 'util/i18n';
import LockMaxValue from './MapComponents/LockMaxValue';
import HeatLegendEdit from './MapComponents/HeatLegendEdit';
import SearchBar from './MapComponents/SearchBar';
import LoadingContainer from '../shared/LoadingContainer';
import {NumberFormatter} from 'util/hooks';
import HeatMap from './MapComponents/HeatMap';
import HeatLegend from './MapComponents/HeatLegend';
import {DataContext} from 'data_sockets/DataContext';
import Container from '@mui/material/Container';
import {selectDistrict} from 'store/DataSelectionSlice';
import legendPresets from '../../../assets/heatmap_legend_presets.json?url';
import {selectHeatmapLegend} from 'store/UserPreferenceSlice';
import {GeoJSON, GeoJsonProperties} from 'geojson';

export default function SidebarTabs(): JSX.Element {
  const {t, i18n} = useTranslation('global');
  const selectedTab = useAppSelector((state) => state.userPreference.selectedTab ?? '1');
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const storeSelectedArea = useAppSelector((state) => state.dataSelection.district);
  const selectedCompartment = useAppSelector((state) => state.dataSelection.compartment);
  const selectedScenario = useAppSelector((state) => state.dataSelection.scenario);
  const storeHeatLegend = useAppSelector((state) => state.userPreference.selectedHeatmap);
  const {formatNumber} = NumberFormatter(i18n.language, 1, 0);
  const {t: tBackend} = useTranslation('backend');
  const tabStyle = useMemo(
    () => ({
      background: theme.palette.background.default,
      [`&.${buttonBaseClasses.root}`]: {
        textTransform: 'none',
        padding: theme.spacing(1),
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
        minHeight: '0',
      },
      [`&.${tabClasses.selected}`]: {
        background: theme.palette.background.paper,
      },
    }),
    [theme]
  );
  
  const handleChange = useCallback(
    (_: unknown, newValue: string) => {
      return dispatch(selectTab(newValue));
    },
    [dispatch]
  );

  const {
    geoData,
    mapData,
    areMapValuesFetching,
    searchBarData,
  }: {
    geoData: GeoJSON | undefined;
    mapData: {id: string; value: number}[] | undefined;
    areMapValuesFetching: boolean;
    searchBarData: GeoJsonProperties[] | undefined;
  } = useContext(DataContext) || {
    geoData: {type: 'FeatureCollection', features: []},
    mapData: [],
    areMapValuesFetching: false,
    searchBarData: [],
  };

  
  const optionLabel = useCallback(
    (option: GeoJsonProperties) => {
      return `${option?.GEN}${option?.BEZ ? ` (${t(`BEZ.${option?.BEZ}`)})` : ''}`;
    },
    [t]
  );

   const defaultValue = useMemo(() => {
    return {
      RS: '00000',
      GEN: t('germany'),
      BEZ: '',
      id: -1,
    };
  }, [t]);

  const [selectedArea, setSelectedArea] = useState<GeoJsonProperties>(
    storeSelectedArea.name != ''
      ? {RS: storeSelectedArea.ags, GEN: storeSelectedArea.name, BEZ: storeSelectedArea.type}
      : defaultValue
  );
  const [aggregatedMax, setAggregatedMax] = useState<number>(1);
  const [legend, setLegend] = useState<HeatmapLegend>(storeHeatLegend);
  const [longLoad, setLongLoad] = useState(false);
  const [fixedLegendMaxValue, setFixedLegendMaxValue] = useState<number | null>(null);

  const legendRef = useRef<am5.HeatLegend | null>(null);
  const calculateToolTip = useCallback(
    (regionData: GeoJsonProperties) => {
      const bez = t(`BEZ.${regionData?.BEZ}`);
      const compartmentName = tBackend(`infection-states.${selectedCompartment}`);
      return selectedScenario !== null && selectedCompartment
        ? `${bez} {GEN}\n${compartmentName}: ${formatNumber(Number(regionData?.value))}`
        : `${bez} {GEN}`;
    },
    [formatNumber, selectedCompartment, selectedScenario, t, tBackend]
  );

  const calculateToolTipFetching = useCallback(
    (regionData: GeoJsonProperties) => {
      const bez = t(`BEZ.${regionData?.BEZ}`);
      return `${bez} {GEN}`;
    },
    [t]
  );

  const localization = useMemo(() => {
    return {
      formatNumber: formatNumber,
    };
  }, [formatNumber]);

  return (
    <Grid id="sidebar-tabs"item sx={{display: 'flex', flexGrow: 1, flexDirection: 'column'}}>

    <TabContext value={selectedTab}>   
    <Box sx={{flexGrow: 0, borderTop: 1, borderColor: 'divider', width: '100%'}}>
          <TabList
            onChange={handleChange}
            centered
            sx={{
              minHeight: '0',
            }}
          >
            <Tab
              label={<Typography>Map</Typography>}
              value='1'
              sx={tabStyle}
            />
            <Tab
               label={<Typography>Statistics</Typography>}
              value='2'
              sx={tabStyle}
            />
          </TabList>
        </Box> 
      <TabPanel value='1' sx={{flexGrow: 1, padding: 0}}>
          <Box id='sidebartabs-main-content'
            sx={{
              display: 'flex',
              flexDirection: 'column',
         //     alignItems: 'center',
         //     justifyContent: 'center',
             // width: '422px',
             width: '100%',
              height: '100%'
            }}
          >
               <Box id='sidebar-map-search-bar-wrapper'>
        <SearchBar
          data={searchBarData}
          sortProperty={'GEN'}
          optionLabel={optionLabel}
          autoCompleteValue={{
            RS: selectedArea?.RS as string,
            GEN: selectedArea?.GEN as string,
            BEZ: selectedArea?.BEZ as string,
            id: selectedArea?.id as number,
          }}
          onChange={(_event, option) => {
            if (option) {
              if (option.RS && option.GEN && option.BEZ) setSelectedArea(option);
              else setSelectedArea(defaultValue);
            }
          }}
          placeholder={`${selectedArea?.GEN}${selectedArea?.BEZ ? ` (${t(`BEZ.${selectedArea?.BEZ}`)})` : ''}`}
          optionEqualProperty='RS'
          valueEqualProperty='RS'
        />
      </Box>
      <Box id='sidebar-map-wrapper'>
        <LoadingContainer show={areMapValuesFetching || longLoad} overlayColor={theme.palette.background.default}>
          <HeatMap
            selectedArea={selectedArea}
            setSelectedArea={setSelectedArea}
            aggregatedMax={aggregatedMax}
            setAggregatedMax={setAggregatedMax}
            legend={legend}
            legendRef={legendRef}
            fixedLegendMaxValue={fixedLegendMaxValue}
            mapData={geoData}
            tooltipText={calculateToolTip}
            tooltipTextWhileFetching={calculateToolTipFetching}
            defaultSelectedValue={defaultValue}
            values={mapData}
            isDataFetching={areMapValuesFetching}
            longLoad={longLoad}
            setLongLoad={setLongLoad}
            selectedScenario={selectedScenario}
            areaId={'RS'}
            localization={localization}
            maxZoomLevel={32}
          />
          <Grid container px={1}>
            <Grid item container xs={11} alignItems='flex-end'>
              <HeatLegend
                legend={legend}
                exposeLegend={useCallback((legend: am5.HeatLegend | null) => {
                  // move exposed legend item (or null if disposed) into ref
                  legendRef.current = legend;
                }, [])}
                min={0}
                // use math.round to convert the numbers to integers
                max={
                  legend.isNormalized
                    ? Math.round(aggregatedMax)
                    : Math.round(legend.steps[legend.steps.length - 1].value)
                }
                displayText={true}
                localization={localization}
              />
            </Grid>
            <Grid item container justifyContent='center' direction={'column'} xs={1}>
              <LockMaxValue
                fixedLegendMaxValue={fixedLegendMaxValue}
                setFixedLegendMaxValue={setFixedLegendMaxValue}
                aggregatedMax={aggregatedMax}
              />
              <HeatLegendEdit
                legend={legend}
                setLegend={setLegend}
                selectedScenario={selectedScenario}
                legendPresetsUrl={legendPresets}
              />
            </Grid>
          </Grid>
        </LoadingContainer>
      </Box>
       
           <a
              href={`https://www.helmholtz.de/loki-pandemics/${i18n.language.includes('de') ? '' : 'en/'}`}
              target='_blank'
              rel='noopener noreferrer'
              style={{width: '40%'}}
            >
              <img src={logo} alt={t('loki-logo')} width='100%' />
            </a> 
          </Box>
        </TabPanel>
        <TabPanel value='2' sx={{flexGrow: 1, padding: 0}}>
        <Box  sx={{height: '100%', position: 'relative', flexGrow: 1}}>
            <Box sx={{position: 'absolute', top: 20, right: 0, bottom: 0, left: 0}}>
              <StatisticsDashboard/>
            </Box>
          </Box>
        </TabPanel> 
     
     </TabContext> 
    </Grid>
  );
}
