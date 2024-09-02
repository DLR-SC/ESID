// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import Grid from '@mui/material/Grid';
import React, {useCallback, useMemo} from 'react';
import TabContext from '@mui/lab/TabContext';
import TabPanel from '@mui/lab/TabPanel';
import Tab, {tabClasses} from '@mui/material/Tab';
import TabList from '@mui/lab/TabList';
import Box from '@mui/material/Box';
import ShowChart from '@mui/icons-material/ShowChart';
import Coronavirus from '@mui/icons-material/Coronavirus';
import Typography from '@mui/material/Typography';
import {buttonBaseClasses} from '@mui/material/ButtonBase';
import {useTranslation} from 'react-i18next';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {selectTab} from '../store/UserPreferenceSlice';
import {useTheme} from '@mui/material/styles';

/*
 * Import the SimulationChart and ParameterEditor components to be displayed in the tabs
 * lazy loading is not needed here, as the performance benefits are minimal
 */
import SimulationChart from './LineChartContainer';
import ParameterEditor from './ParameterEditor';
import InspireGrid from './InspireGridContainer';

/**
 * This component manages the main content, which is a collection of tabs that the user can navigate through. By default
 * the Simulation Chart is being shown.
 */
export default function MainContentTabs() {
  const {t} = useTranslation();
  const selectedTab = useAppSelector((state) => state.userPreference.selectedTab ?? '1');
  const dispatch = useAppDispatch();
  const theme = useTheme();

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

  return (
    <Grid item sx={{display: 'flex', flexGrow: 1, flexDirection: 'column'}}>
      <TabContext value={selectedTab}>
        <TabPanel value='1' sx={{flexGrow: 1, padding: 0}}>
          <Box id='main-content-simulation-chart-wrapper' sx={{height: '100%'}}>
            <SimulationChart />
          </Box>
        </TabPanel>
        <TabPanel value='2' sx={{flexGrow: 1, padding: 0}}>
          <Box id='main-content-parameter-editor-wrapper' sx={{height: '100%', position: 'relative', flexGrow: 1}}>
            <Box sx={{position: 'absolute', top: 0, right: 0, bottom: 0, left: 0}}>
              <ParameterEditor />
            </Box>
          </Box>
        </TabPanel>
        <TabPanel value='3' sx={{flexGrow: 1, padding: 0}}>
          <Box id='main-content-inspire-grid-wrapper' sx={{height: '100%', position: 'relative', flexGrow: 1}}>
            <Box sx={{position: 'absolute', top: 0, right: 0, bottom: 0, left: 0}}>
              <InspireGrid />
            </Box>
          </Box>
        </TabPanel>
        <Box sx={{flexGrow: 0, borderTop: 1, borderColor: 'divider', width: '100%'}} id='tab-list'>
          <TabList
            onChange={handleChange}
            centered
            sx={{
              minHeight: '0',
            }}
          >
            <Tab
              label={<Typography variant='body1'>{t('bottomTabs.timeSeries')}</Typography>}
              icon={<ShowChart />}
              iconPosition='start'
              value='1'
              sx={tabStyle}
            />
            <Tab
              label={<Typography variant='body1'>{t('bottomTabs.parameters')}</Typography>}
              icon={<Coronavirus />}
              iconPosition='start'
              value='2'
              sx={tabStyle}
            />
            <Tab
              label={<Typography variant='body1'>{t('bottomTabs.pandemos')}</Typography>}
              icon={<Grid />}
              iconPosition='start'
              value='3'
              sx={tabStyle}
            />
          </TabList>
        </Box>
      </TabContext>
    </Grid>
  );
}
