// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {useState, useEffect, useRef, useCallback, useMemo, useContext} from 'react';
import {useTranslation} from 'react-i18next';
import {Grid, Stack, useTheme} from '@mui/material';
import * as am5 from '@amcharts/amcharts5';
import {useAppDispatch, useAppSelector} from 'store/hooks';
import {HeatmapLegend} from 'types/heatmapLegend';
import i18n from 'util/i18n';
import LockMaxValue from './MapComponents/LockMaxValue';
import HeatLegendEdit from './MapComponents/HeatLegendEdit';
import SearchBar from './MapComponents/SearchBar';
import LoadingContainer from '../shared/LoadingContainer';
import {NumberFormatter} from 'util/hooks';
import HeatMap from './MapComponents/HeatMap';
import HeatLegend from './MapComponents/HeatLegend';
import {DataContext} from 'DataContext';
import SidebarTabs from './SidebarTabs';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import {selectDistrict} from 'store/DataSelectionSlice';
import legendPresets from '../../../assets/heatmap_legend_presets.json?url';
import {selectHeatmapLegend} from 'store/UserPreferenceSlice';
import {GeoJSON, GeoJsonProperties} from 'geojson';

export default function MapContainer() {
  const {t} = useTranslation();
  const {formatNumber} = NumberFormatter(i18n.language, 1, 0);
  const {t: tBackend} = useTranslation('backend');
  const theme = useTheme();
  const dispatch = useAppDispatch();

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

  const storeSelectedArea = useAppSelector((state) => state.dataSelection.district);
  const selectedCompartment = useAppSelector((state) => state.dataSelection.compartment);
  const selectedScenario = useAppSelector((state) => state.dataSelection.scenario);
  const storeHeatLegend = useAppSelector((state) => state.userPreference.selectedHeatmap);

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

  // Set selected area on first load. If language change and selected area is germany, set default value again to update the name
  useEffect(() => {
    if (selectedArea?.RS === '00000') {
      setSelectedArea(defaultValue);
    }
    // This effect should only run when the language changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language]);

  // Set selected area in store
  useEffect(() => {
    dispatch(
      selectDistrict({
        ags: String(selectedArea?.['RS']),
        name: String(selectedArea?.['GEN']),
        type: String(selectedArea?.['BEZ']),
      })
    );
    // This effect should only run when the selectedArea changes
  }, [selectedArea, dispatch]);

  // Set legend in store
  useEffect(() => {
    dispatch(selectHeatmapLegend({legend: legend}));
    // This effect should only run when the legend changes
  }, [legend, dispatch]);

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

  const optionLabel = useCallback(
    (option: GeoJsonProperties) => {
      return `${option?.GEN}${option?.BEZ ? ` (${t(`BEZ.${option?.BEZ}`)})` : ''}`;
    },
    [t]
  );

  return (
    <Stack
      id='sidebar-root'
      direction='column'
      alignItems='stretch'
      justifyContent='flex-start'
      sx={{
        width: '422px',
        borderRight: `1px solid ${theme.palette.divider}`,
        background: theme.palette.background.default,
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
          <Grid container px={1} id='side-bar-heat-legend'>
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
      <Container disableGutters sx={{flexGrow: 1}}>
        <SidebarTabs />
      </Container>
    </Stack>
  );
}
