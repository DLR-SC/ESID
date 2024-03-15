import Grid from '@mui/material/Grid';
import React from 'react';
import TabContext from '@mui/lab/TabContext';
import TabPanel from '@mui/lab/TabPanel';
import Tab, {tabClasses, TabProps} from '@mui/material/Tab';
import TabList from '@mui/lab/TabList';
import Box from '@mui/material/Box';
import ShowChart from '@mui/icons-material/ShowChart';
import Coronavirus from '@mui/icons-material/Coronavirus';
import styled from '@mui/material/styles/styled';
import Typography from '@mui/material/Typography';
import {buttonBaseClasses} from '@mui/material/ButtonBase';
import {useTranslation} from 'react-i18next';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {selectTab} from '../store/UserPreferenceSlice';

// Lazily load the tab contents to enable code splitting.
const ParameterEditor = React.lazy(() => import('./ParameterEditor'));
const SimulationChart = React.lazy(() => import('./SimulationChart'));

const TabItem = styled(Tab)<TabProps>(({theme}) => ({
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
}));

/**
 * This component manages the main content, which is a collection of tabs that the user can navigate through. By default
 * the Simulation Chart is being shown.
 */
export default function MainContentTabs() {
  const {t} = useTranslation();
  const selectedTab = useAppSelector((state) => state.userPreference.selectedTab ?? '1');
  const dispatch = useAppDispatch();

  const handleChange = (_: unknown, newValue: string) => dispatch(selectTab(newValue));

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
        <Box sx={{flexGrow: 0, borderTop: 1, borderColor: 'divider', width: '100%'}}>
          <TabList
            onChange={handleChange}
            centered
            sx={{
              minHeight: '0',
            }}
          >
            <TabItem
              label={<Typography variant='body1'>{t('bottomTabs.timeSeries')}</Typography>}
              icon={<ShowChart />}
              iconPosition='start'
              value='1'
            />
            <TabItem
              label={<Typography variant='body1'>{t('bottomTabs.parameters')}</Typography>}
              icon={<Coronavirus />}
              iconPosition='start'
              value='2'
            />
          </TabList>
        </Box>
      </TabContext>
    </Grid>
  );
}
