// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import Box from '@mui/material/Box';
import React, {useCallback, useMemo} from 'react';
import {Typography} from '@mui/material';
import TabContext from '@mui/lab/TabContext';
import TabPanel from '@mui/lab/TabPanel';
import {useAppDispatch, useAppSelector} from 'store/hooks';
import TabList from '@mui/lab/TabList';
import {selectSidebarTab} from 'store/UserPreferenceSlice';
import Tab, {tabClasses} from '@mui/material/Tab';
import {useTheme} from '@mui/material/styles';
import {buttonBaseClasses} from '@mui/material/ButtonBase';
import TripChainView from '../TripChainView';
import StatisticsDashboard from './StatisicsComponent/StatisticsDashboard';

export default function SidebarTabs(): JSX.Element {
  const selectedTab = useAppSelector((state) => state.userPreference.selectedSidebarTab ?? '1');
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
      return dispatch(selectSidebarTab(newValue));
    },
    [dispatch]
  );

  return (
    <Box
      id='sidebar-tabs'
      sx={{
        // Self
        height: '100%',
        width: '100%',

        // Child layout
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <TabContext value={selectedTab}>
        <Box sx={{flexGrow: 0, borderBottom: 1, borderColor: 'divider', width: '100%'}}>
          <TabList
            onChange={handleChange}
            variant='fullWidth'
            centered
            sx={{
              minHeight: '0',
            }}
          >
            <Tab label={<Typography>Statistics</Typography>} value='1' sx={tabStyle} />
            <Tab label={<Typography>Trip Chains</Typography>} value='2' sx={tabStyle} />
          </TabList>
        </Box>
        <TabPanel value='1' sx={{flexGrow: 1, padding: 0}}>
          <Box sx={{height: '100%', position: 'relative'}}>
            <Box sx={{position: 'absolute', top: 20, right: 0, bottom: 0, left: 0}}>{<StatisticsDashboard />}</Box>
          </Box>
        </TabPanel>
        <TabPanel value='2' sx={{flexGrow: 1, padding: 0, overflowY: 'auto'}}>
          <TripChainView />
        </TabPanel>
      </TabContext>
    </Box>
  );
}
