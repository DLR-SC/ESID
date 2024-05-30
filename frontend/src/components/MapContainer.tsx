import {useState, useEffect, useRef, useCallback, useMemo, useContext} from 'react';
import {useTranslation} from 'react-i18next';
import data from '../../assets/lk_germany_reduced.geojson?url';
import {Grid, Stack, useTheme} from '@mui/material';
import * as am5 from '@amcharts/amcharts5';
import React from 'react';
import {useAppDispatch} from 'store/hooks';
import {HeatmapLegend} from 'types/heatmapLegend';
import {FeatureProperties, FeatureCollection} from 'types/map';
import i18n from 'util/i18n';
import LockMaxValue from './MapComponents/LockMaxValue';
import HeatLegendEdit from './MapComponents/HeatLegendEdit';
import SearchBar from './MapComponents/SearchBar';
import LoadingContainer from './shared/LoadingContainer';
import {NumberFormatter} from 'util/hooks';
import HeatMap from './MapComponents/HeatMap';
import HeatLegend from './MapComponents/HeatLegend';
import {setSelectedAreaStore} from 'store/MapSlice';
import {DataContext} from 'DataContext';
import SidebarTabs from './Sidebar/SidebarTabs';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';

export default function MapContainer() {
  const {t} = useTranslation();
  const {formatNumber} = NumberFormatter(i18n.language, 1, 0);
  const {t: tBackend} = useTranslation('backend');
  const theme = useTheme();

  const defaultValue = useMemo(() => {
    return {
      RS: '00000',
      GEN: t('germany'),
      BEZ: '',
      id: -1,
    };
  }, [t]);

  const [geoData, setGeoData] = useState<FeatureCollection>();
  const [selectedArea, setSelectedArea] = useState<FeatureProperties>(defaultValue);

  const [aggregatedMax, setAggregatedMax] = useState<number>(1);
  const legendRef = useRef<am5.HeatLegend | null>(null);
  const [legend, setLegend] = useState<HeatmapLegend>({
    name: 'uninitialized',
    isNormalized: true,
    steps: [
      {color: 'rgb(255,255,255)', value: 0},
      {color: 'rgb(255,255,255)', value: 1},
    ],
  });
  const [longLoad, setLongLoad] = useState(false);
  const [fixedLegendMaxValue, setFixedLegendMaxValue] = useState<number | null>(null);
  const selectedScenario = 0;

  const {
    mapData,
    areMapValuesFetching,
  }: {mapData: {id: string; value: number}[] | undefined; areMapValuesFetching: boolean} = useContext(DataContext) || {
    mapData: [],
    areMapValuesFetching: false,
  };

  // Fetch Map Coordinates and properties from GeoJSON file via URL and set GeoData
  useEffect(() => {
    const fetchData = async () => {
      const geoData = await fetch(data, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });
      const geoDataJson = await geoData.json();
      setGeoData(geoDataJson);
    };
    fetchData();
  }, []);

  const selectedCompartment = 'Infected';

  const calculateToolTip = useCallback(
    (regionData: FeatureProperties) => {
      const bez = t(`BEZ.${regionData.BEZ}`);
      const compartmentName = tBackend(`infection-states.${selectedCompartment}`);
      return selectedScenario !== null && selectedCompartment
        ? `${bez} {GEN}\n${compartmentName}: ${formatNumber(Number(regionData.value))}`
        : `${bez} {GEN}`;
    },
    [formatNumber, t, tBackend]
  );

  const calculateToolTipFetching = useCallback(
    (regionData: FeatureProperties) => {
      const bez = t(`BEZ.${regionData.BEZ}`);
      return `${bez} {GEN}`;
    },
    [t]
  );

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setSelectedAreaStore(selectedArea));
  }, [selectedArea, dispatch]);

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
          data={geoData}
          defaultValue={{
            RS: '00000',
            GEN: t('germany'),
            BEZ: '',
            id: -1,
          }}
          sortProperty={'GEN'}
          optionLabel={(option) => `${option.GEN}${option.BEZ ? ` (${t(`BEZ.${option.BEZ}`)})` : ''}`}
          autoCompleteValue={{
            RS: selectedArea['RS'],
            GEN: selectedArea['GEN'],
            BEZ: selectedArea['BEZ'],
            id: selectedArea['id'],
          }}
          onChange={(_event, option) => {
            if (option) {
              setSelectedArea(option);
            }
          }}
          placeholder={`${selectedArea.GEN}${selectedArea.BEZ ? ` (${t(`BEZ.${selectedArea.BEZ}`)})` : ''}`}
        />
      </Box>
      <Box id='sidebar-map-wrapper'>
        <LoadingContainer show={areMapValuesFetching && longLoad} overlayColor={theme.palette.background.default}>
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
            idValuesToMap={'RS'}
            formatNumber={formatNumber}
          />
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
                  legend.isNormalized
                    ? Math.round(aggregatedMax)
                    : Math.round(legend.steps[legend.steps.length - 1].value)
                }
                displayText={true}
                id={'legend'}
                formatNumber={formatNumber}
              />
            </Grid>
            <Grid item container justifyContent='center' direction={'column'} xs={1}>
              <LockMaxValue
                fixedLegendMaxValue={fixedLegendMaxValue}
                setFixedLegendMaxValue={setFixedLegendMaxValue}
                aggregatedMax={aggregatedMax}
                t={t}
              />
              <HeatLegendEdit
                legend={legend}
                setLegend={setLegend}
                selectedScenario={selectedScenario}
                formatNumber={formatNumber}
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
