import React from 'react';
import Scenario from './Scenario';
import IconBar from './IconBar';

import SimulationChart from './SimulationChart';
import {Divider, Grid} from '@mui/material';
import {useTheme} from '@mui/material/styles';

//  Including horizontal tabs 
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import GridHeatmap from './GridHeatmap';


// Definition of tab panel interface and its functions
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

export default function MainContent(): JSX.Element {
  const theme = useTheme();
  const [value, setValue] = React.useState(0);
  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue); 
  };
  return (
    <Grid
      container
      direction='column'
      sx={{
        background: theme.palette.background.default,
      }}
    >
      <Grid
        item
        sx={{
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        <IconBar />
      </Grid>
      <Grid item>
        <Scenario />
      </Grid>
      <Grid item>
        <Divider
          sx={{
            borderBottom: `1px solid ${theme.palette.divider}`,
            backgroundColor: 'transparent',
            margin: `${theme.spacing(4)} 0 0 0`,
          }}
        />
      </Grid>
      <Grid item sx={{flexGrow: 2}}>
      {/* <Box sx={{ borderBottom: 1, borderColor: 'divider' }}> */}
      <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
        <Tab label="Simulation Chart" />
        <Tab label="Detailed View"  />
      </Tabs>
      <TabPanel value={value} index={0}>
        <SimulationChart />
      </TabPanel>
      <TabPanel value={value} index={1}>
      <GridHeatmap />
      </TabPanel>
      {/* </Box> */}
      </Grid>
    </Grid>
  );
}
