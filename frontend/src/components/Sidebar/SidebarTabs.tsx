import Box from '@mui/material/Box';
import {useTranslation} from 'react-i18next';
import React from 'react';
import logo from 'assets/logo/LOKI_compact.svg';

export default function SidebarTabs(): JSX.Element {
  const {t} = useTranslation('global');

  /*
  const [value, setValue] = React.useState(0);
  const handleChange = (_: React.ChangeEvent<unknown>, newValue: number) => setValue(newValue);
  */

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '422px',
        height: '100%',
      }}
    >
      {/* This is a placeholder for now. */}
      <a href='https://www.dlr.de/' target='_blank' rel='noopener noreferrer' style={{width: '40%'}}>
        <img src={logo} alt={t('dlr-logo')} width='100%' />
      </a>

      {/*
      <Tabs value={value} onChange={handleChange} aria-label='todo' variant='fullWidth'>
        <Tab label={t('history.Tabtitle')} {...a11yProps(0)} />
        <Tab label={t('details.Tabtitle')} {...a11yProps(0)} />
      </Tabs>
      <TabPanel value={value} index={0}>
        <p>History</p>
      </TabPanel>
      <TabPanel value={value} index={1}>
        <p>Details</p>
      </TabPanel>
      */}
    </Box>
  );
}

/*
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}
function TabPanel(props: TabPanelProps) {
  const {children, value, index, ...other} = props;

  return (
    <Box
      sx={{display: 'flex', flexGrow: 1}}
      role='tab-panel'
      hidden={value !== index}
      id={`sidebar-tab-panel-${index}`}
      aria-labelledby={`sidebar-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{p: 3}}>{children}</Box>}
    </Box>
  );
}

function a11yProps(index: number) {
  return {
    id: `sidebar-tab-${index}`,
    'aria-controls': `sidebar-tabpanel-${index}`,
  };
}
*/
