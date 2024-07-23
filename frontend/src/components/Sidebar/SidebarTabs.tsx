// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import Box from '@mui/material/Box';
import {useTranslation} from 'react-i18next';
import React, { useCallback, useMemo } from 'react';
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

export default function SidebarTabs(): JSX.Element {
  const {t, i18n} = useTranslation('global');
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
          <Box id='sidebartabs-main-content'
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '422px',
              height: '100%',
            }}
          >

        {/* Hidden because of alignment issue of sidebartabs on sidebar container at the top -- Pawan*/}
       {/*      <a
              href={`https://www.helmholtz.de/loki-pandemics/${i18n.language.includes('de') ? '' : 'en/'}`}
              target='_blank'
              rel='noopener noreferrer'
              style={{width: '40%'}}
            >
              <img src={logo} alt={t('loki-logo')} width='100%' />
            </a> */}
          </Box>
        </TabPanel>
        <TabPanel value='2' sx={{flexGrow: 1, padding: 0}}>
        <Box  sx={{height: '100%', position: 'relative', flexGrow: 1}}>
            <Box sx={{position: 'absolute', top: 0, right: 0, bottom: 0, left: 0}}>
              
            </Box>
          </Box>
        </TabPanel> 
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
     </TabContext> 
    </Grid>
  );
}
