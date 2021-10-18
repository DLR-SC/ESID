import {Box, Tabs, Tab } from '@mui/material';
import React from 'react';

export default function SidebarTabs(): JSX.Element {
  //const {t} = useTranslation('global');

  const [value, setValue] = React.useState(0);
  const handleChange = (_: React.ChangeEvent<unknown>, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box display='flex' flexDirection='column' alignItems='stretch' style={{width: '422px', height: '100%'}}>
      <Tabs value={value} onChange={handleChange} aria-label='todo' variant='fullWidth'>
        <Tab label='History' {...a11yProps(0)} />
        <Tab label='Details' {...a11yProps(0)} />
      </Tabs>
      <TabPanel value={value} index={0}/>
      <TabPanel value={value} index={1}/>
    </Box>
  );
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <Box
      display='flex'
      role="tab-panel"
      hidden={value !== index}
      id={`sidebar-tab-panel-${index}`}
      aria-labelledby={`sidebar-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </Box>
  );
}

function a11yProps(index: number) {
  return {
    id: `sidebar-tab-${index}`,
    'aria-controls': `sidebar-tabpanel-${index}`,
  };
}