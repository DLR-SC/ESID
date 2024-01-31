import Grid from '@mui/material/Grid';
import SimulationChart from './SimulationChart';
import React from 'react';
import TabContext from '@mui/lab/TabContext';
import TabPanel from '@mui/lab/TabPanel';
import Tab from '@mui/material/Tab';
import TabList from '@mui/lab/TabList';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function MainContentTabs() {
  const [value, setValue] = React.useState('1');

  const handleChange = (_: any, newValue: string) => {
    setValue(newValue);
  };

  return (
    <Grid item sx={{display: 'flex', flexGrow: 1, flexDirection: 'column'}}>
      <TabContext value={value}>
        <TabPanel value='1' sx={{flexGrow: 1, padding: 0}}>
          <Box id='main-content-simulation-chart-wrapper' sx={{height: '100%'}}>
            <SimulationChart />
          </Box>
        </TabPanel>
        <TabPanel value='2' sx={{flexGrow: 1, padding: 0}}>
          <Typography variant='body1'>TODO Parameters</Typography>
        </TabPanel>
        <Box sx={{borderTop: 1, borderColor: 'divider'}}>
          <TabList onChange={handleChange} aria-label='TODO'>
            <Tab label='TODO SIMCHART' value='1' />
            <Tab label='TODO PARAMS' value='2' />
          </TabList>
        </Box>
      </TabContext>
    </Grid>
  );
}