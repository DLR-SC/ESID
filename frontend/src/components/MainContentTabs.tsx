// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import Grid from '@mui/material/Grid';
import React, {useCallback, useMemo, useState} from 'react';
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
import {setIsParametersTabClicked} from 'store/UserOnboardingSlice';

const SimulationChart = React.lazy(() => import('./LineChartContainer'));
const ParameterEditor = React.lazy(() => import('./ParameterEditor'));

/**
 * This component manages the main content, which is a collection of tabs that the user can navigate through. By default
 * the Simulation Chart is being shown.
 */
export default function MainContentTabs() {
  const {t} = useTranslation();
  const selectedTab = useAppSelector((state) => state.userPreference.selectedTab ?? '1');
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const [previousTab, setPreviousTab] = useState<string>(selectedTab);

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
      // this check is for the onboarding tour of the line chart, if the user switches the tabs, we dispatch an action and update the setIsParametersTabClicked state accordingly
      if (previousTab === '2' && newValue !== '2') {
        dispatch(setIsParametersTabClicked(false));
      }
      if (newValue === '2') {
        dispatch(setIsParametersTabClicked(true));
      }
      dispatch(selectTab(newValue));
      setPreviousTab(newValue);
    },
    [previousTab, dispatch]
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
        <Box sx={{flexGrow: 0, borderTop: 1, borderColor: 'divider', width: '100%'}} id='tab-parameter-editor'>
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
          </TabList>
        </Box>
      </TabContext>
    </Grid>
  );
}
